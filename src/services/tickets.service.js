import crypto from 'crypto';
import ticketsRepository from '../repositories/tickets.repository.js';
import eventsRepository from '../repositories/events.repository.js';
import TicketDTO from '../dto/ticket.dto.js';
import mailService from './mail.service.js';

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class TicketsService {
  constructor(repository, eventsRepo, mailer) {
    this.repository = repository;
    this.eventsRepo = eventsRepo;
    this.mailer = mailer;
  }

  async enrollInEvent(eventId, rawQuantity, currentUser) {
    if (!this.eventsRepo.isValidId(eventId)) {
      throw createHttpError('ID de evento inválido', 400);
    }

    const quantity = rawQuantity === undefined ? 1 : Number(rawQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw createHttpError('La cantidad (quantity) debe ser un número entero mayor a 0', 400);
    }

    const event = await this.eventsRepo.findEventById(eventId);
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

    const occupied = await this.repository.countActiveTickets(eventId);
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

    return TicketDTO.from(created);
  }

  async getMyTickets(userId) {
    const tickets = await this.repository.findTicketsByUser(userId);
    return TicketDTO.fromList(tickets);
  }

  async getEventTickets(eventId, currentUser) {
    if (!this.eventsRepo.isValidId(eventId)) {
      throw createHttpError('ID de evento inválido', 400);
    }

    const event = await this.eventsRepo.findEventById(eventId);
    if (!event) {
      throw createHttpError('Evento no encontrado', 404);
    }

    if (currentUser.role !== 'admin' && event.organizer?.toString() !== currentUser.id) {
      throw createHttpError('No tenés permisos para ver las inscripciones de este evento', 403);
    }

    const [tickets, occupied] = await Promise.all([
      this.repository.findTicketsByEvent(eventId),
      this.repository.countActiveTickets(eventId)
    ]);

    return {
      capacity: event.capacity,
      occupied,
      available: Math.max(0, event.capacity - occupied),
      tickets: TicketDTO.fromList(tickets)
    };
  }

  async cancelTicket(ticketId, currentUser) {
    if (!this.repository.isValidId(ticketId)) {
      throw createHttpError('ID de ticket inválido', 400);
    }

    const existing = await this.repository.findTicketById(ticketId);
    if (!existing) {
      throw createHttpError('Ticket no encontrado', 404);
    }

    if (currentUser.role !== 'admin' && existing.user?.toString() !== currentUser.id) {
      throw createHttpError('No tenés permisos para cancelar este ticket', 403);
    }

    if (existing.status === 'cancelled') {
      throw createHttpError('El ticket ya se encuentra cancelado', 400);
    }

    const updated = await this.repository.cancelTicket(ticketId);
    return TicketDTO.from(updated);
  }
}

export const ticketsService = new TicketsService(ticketsRepository, eventsRepository, mailService);
export default ticketsService;
