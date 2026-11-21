import mongoose from 'mongoose';
import eventsRepository from '../repositories/events.repository.js';

const formatEvent = (event) => ({
  id: (event._id || event.id).toString(),
  title: event.title,
  description: event.description,
  sportType: event.sportType,
  category: event.category,
  location: event.location,
  date: event.date,
  maxParticipants: event.maxParticipants,
  price: event.price,
  status: event.status,
  organizer: event.organizer ? event.organizer.toString() : null
});

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllEvents() {
    const events = await this.repository.getEvents({ status: { $ne: 'cancelled' } });
    return events.map(formatEvent);
  }

  async getEventById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError('ID de evento inválido', 400);
    }

    const event = await this.repository.getEventById(id);
    if (!event) {
      throw createHttpError('Evento no encontrado', 404);
    }

    return formatEvent(event);
  }

  async createEvent(eventData, organizerId) {
    const { title, description, sportType, category, location, date, maxParticipants, price } = eventData;

    if (!title || !sportType || !location || !date || maxParticipants === undefined) {
      throw createHttpError('Faltan campos obligatorios para crear el evento', 400);
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw createHttpError('Fecha de evento inválida', 400);
    }

    const parsedMax = Number(maxParticipants);
    if (Number.isNaN(parsedMax) || parsedMax < 1) {
      throw createHttpError('El cupo máximo debe ser al menos 1', 400);
    }

    const parsedPrice = price !== undefined ? Number(price) : 0;
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw createHttpError('El precio no puede ser negativo', 400);
    }

    const created = await this.repository.createEvent({
      title: title.trim(),
      description: description ? description.trim() : undefined,
      sportType: sportType.trim(),
      category: category ? category.trim() : 'General',
      location: location.trim(),
      date: parsedDate,
      maxParticipants: parsedMax,
      price: parsedPrice,
      status: 'published',
      organizer: organizerId
    });

    return formatEvent(created);
  }

  async updateEvent(id, updateData, currentUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError('ID de evento inválido', 400);
    }

    const existing = await this.repository.getEventById(id);
    if (!existing) {
      throw createHttpError('Evento no encontrado', 404);
    }

    // Validación de propiedad del recurso: organizer solo modifica los suyos; admin modifica cualquiera
    if (currentUser.role !== 'admin' && existing.organizer?.toString() !== currentUser.id) {
      throw createHttpError('No tenés permisos para modificar este evento', 403);
    }

    const allowedFields = ['title', 'description', 'sportType', 'category', 'location', 'date', 'maxParticipants', 'price'];
    const payload = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        payload[field] = updateData[field];
      }
    }

    if (payload.date !== undefined) {
      const parsedDate = new Date(payload.date);
      if (Number.isNaN(parsedDate.getTime())) {
        throw createHttpError('Fecha de evento inválida', 400);
      }
      payload.date = parsedDate;
    }

    if (payload.maxParticipants !== undefined) {
      const parsedMax = Number(payload.maxParticipants);
      if (Number.isNaN(parsedMax) || parsedMax < 1) {
        throw createHttpError('El cupo máximo debe ser al menos 1', 400);
      }
      payload.maxParticipants = parsedMax;
    }

    if (payload.price !== undefined) {
      const parsedPrice = Number(payload.price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        throw createHttpError('El precio no puede ser negativo', 400);
      }
      payload.price = parsedPrice;
    }

    if (Object.keys(payload).length === 0) {
      throw createHttpError('No se enviaron campos válidos para actualizar', 400);
    }

    const updated = await this.repository.updateEvent(id, payload);
    return formatEvent(updated);
  }

  async cancelEvent(id, currentUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError('ID de evento inválido', 400);
    }

    const existing = await this.repository.getEventById(id);
    if (!existing) {
      throw createHttpError('Evento no encontrado', 404);
    }

    if (currentUser.role !== 'admin' && existing.organizer?.toString() !== currentUser.id) {
      throw createHttpError('No tenés permisos para cancelar este evento', 403);
    }

    const updated = await this.repository.updateEvent(id, { status: 'cancelled' });
    return formatEvent(updated);
  }
}

export const eventsService = new EventsService(eventsRepository);
export default eventsService;
