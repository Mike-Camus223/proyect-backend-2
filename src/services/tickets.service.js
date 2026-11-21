import crypto from 'crypto';
import mongoose from 'mongoose';
import ticketsRepository from '../repositories/tickets.repository.js';
import eventsRepository from '../repositories/events.repository.js';
import mailService from './mail.service.js';

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatRef = (ref, fields) => {
  if (!ref) return null;
  if (!(ref instanceof mongoose.Types.ObjectId) && typeof ref === 'object' && (ref._id || ref.id)) {
    const obj = { id: (ref._id || ref.id).toString() };
    for (const f of fields) {
      if (ref[f] !== undefined) obj[f] = ref[f];
    }
    return obj;
  }
  return ref.toString();
};

const formatTicket = (ticket) => ({
  id: (ticket._id || ticket.id).toString(),
  user: formatRef(ticket.user, ['first_name', 'last_name', 'email']),
  event: formatRef(ticket.event, ['title', 'date', 'location', 'status']),
  status: ticket.status,
  quantity: ticket.quantity,
  reservationCode: ticket.reservationCode,
  cancelledAt: ticket.cancelledAt || null,
  createdAt: ticket.createdAt
});

class TicketsService {
  constructor(repository, eventsRepo, mailer) {
    this.repository = repository;
    this.eventsRepo = eventsRepo;
    this.mailer = mailer;
  }

  /**
   * Inscribe a un usuario autenticado en un evento validando estado, fecha,
   * duplicados, cupos disponibles y enviando notificación por email.
   */
  async enrollInEvent(eventId, rawQuantity, currentUser) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw createHttpError('ID de evento inválido', 400);
    }

    const quantity = rawQuantity === undefined ? 1 : Number(rawQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw createHttpError('La cantidad (quantity) debe ser un número entero mayor a 0', 400);
    }

    const event = await this.eventsRepo.getEventById(eventId);
    if (!event) {
      throw createHttpError('Evento no encontrado', 404);
    }

    if (event.status === 'cancelled' || event.status === 'finished') {
      throw createHttpError(`No es posible inscribirse a un evento en estado ${event.status}`, 400);
    }

    if (event.status !== 'published') {
      throw createHttpError('El evento todavía no está publicado para inscripciones', 400);
    }

    if (new Date(event.date) <= new Date()) {
      throw createHttpError('No es posible inscribirse a un evento cuya fecha ya pasó', 400);
    }

    const existingActive = await this.repository.findActiveTicket(currentUser.id, eventId);
    if (existingActive) {
      throw createHttpError('Ya tenés una inscripción activa para este evento', 409);
    }

    const occupied = await this.repository.getOccupiedCapacity(eventId);
    const available = event.capacity - occupied;

    if (quantity > available) {
      throw createHttpError(
        `No hay cupos suficientes disponibles para este evento (disponibles: ${Math.max(0, available)})`,
        400
      );
    }

    const reservationCode = `TCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const created = await this.repository.createTicket({
      user: currentUser.id,
      event: eventId,
      status: 'confirmed',
      quantity,
      reservationCode
    });

    try {
      await this.mailer.sendTicketConfirmation({
        to: currentUser.email,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        quantity,
        reservationCode
      });
    } catch (mailError) {
      console.error('Error enviando email de confirmación:', mailError.message);
    }

    return formatTicket(created);
  }

  /**
   * Lista los tickets pertenecientes al usuario autenticado con datos del evento.
   */
  async getMyTickets(userId) {
    const tickets = await this.repository.getTicketsByUser(userId);
    return tickets.map(formatTicket);
  }

  /**
   * Lista los tickets de un evento para su organizador dueño o para un administrador.
   */
  async getEventTickets(eventId, currentUser) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw createHttpError('ID de evento inválido', 400);
    }

    const event = await this.eventsRepo.getEventById(eventId);
    if (!event) {
      throw createHttpError('Evento no encontrado', 404);
    }

    if (currentUser.role !== 'admin' && event.organizer?.toString() !== currentUser.id) {
      throw createHttpError('No tenés permisos para ver las inscripciones de este evento', 403);
    }

    const [tickets, occupied] = await Promise.all([
      this.repository.getTicketsByEvent(eventId),
      this.repository.getOccupiedCapacity(eventId)
    ]);

    return {
      capacity: event.capacity,
      occupied,
      available: Math.max(0, event.capacity - occupied),
      tickets: tickets.map(formatTicket)
    };
  }

  /**
   * Cancela lógicamente un ticket registrando cancelledAt y liberando su cupo.
   */
  async cancelTicket(ticketId, currentUser) {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw createHttpError('ID de ticket inválido', 400);
    }

    const existing = await this.repository.getTicketById(ticketId);
    if (!existing) {
      throw createHttpError('Ticket no encontrado', 404);
    }

    if (currentUser.role !== 'admin' && existing.user?.toString() !== currentUser.id) {
      throw createHttpError('No tenés permisos para cancelar este ticket', 403);
    }

    if (existing.status === 'cancelled') {
      throw createHttpError('El ticket ya se encuentra cancelado', 400);
    }

    const updated = await this.repository.updateTicket(ticketId, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    return formatTicket(updated);
  }
}

export const ticketsService = new TicketsService(ticketsRepository, eventsRepository, mailService);
export default ticketsService;
