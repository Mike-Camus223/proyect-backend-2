import mongoose from 'mongoose';
import eventsRepository from '../repositories/events.repository.js';

const VALID_STATUSES = ['draft', 'published', 'cancelled', 'finished'];
const SORTABLE_FIELDS = ['date', 'price', 'capacity', 'title', 'createdAt'];

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatOrganizer = (organizer) => {
  if (!organizer) return null;
  if (typeof organizer === 'object' && organizer._id) {
    return {
      id: organizer._id.toString(),
      first_name: organizer.first_name,
      last_name: organizer.last_name,
      email: organizer.email
    };
  }
  return organizer.toString();
};

const formatEvent = (event) => ({
  id: (event._id || event.id).toString(),
  title: event.title,
  description: event.description,
  category: event.category,
  ...(event.sportType ? { sportType: event.sportType } : {}),
  date: event.date,
  location: event.location,
  capacity: event.capacity,
  price: event.price,
  status: event.status,
  organizer: formatOrganizer(event.organizer)
});

const parseFutureDate = (dateValue) => {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    throw createHttpError('Fecha de evento inválida', 400);
  }
  if (parsed <= new Date()) {
    throw createHttpError('La fecha del evento no puede estar en el pasado', 400);
  }
  return parsed;
};

const validateCapacity = (capacity) => {
  const parsed = Number(capacity);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw createHttpError('La capacidad (capacity) debe ser mayor a 0', 400);
  }
  return parsed;
};

const validatePrice = (price) => {
  const parsed = Number(price);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw createHttpError('El precio no puede ser negativo', 400);
  }
  return parsed;
};

class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllEvents(query = {}) {
    const filter = {};

    if (query.status) {
      if (!VALID_STATUSES.includes(query.status)) {
        throw createHttpError('Estado de filtro inválido', 400);
      }
      filter.status = query.status;
    } else {
      filter.status = { $ne: 'cancelled' };
    }

    if (query.category) {
      filter.category = new RegExp(`^${escapeRegex(query.category.trim())}$`, 'i');
    }

    if (query.location) {
      filter.location = new RegExp(escapeRegex(query.location.trim()), 'i');
    }

    if (query.dateFrom || query.dateTo) {
      filter.date = {};
      if (query.dateFrom) {
        const from = new Date(query.dateFrom);
        if (Number.isNaN(from.getTime())) {
          throw createHttpError('Parámetro dateFrom inválido', 400);
        }
        filter.date.$gte = from;
      }
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        if (Number.isNaN(to.getTime())) {
          throw createHttpError('Parámetro dateTo inválido', 400);
        }
        filter.date.$lte = to;
      }
    }

    const page = query.page !== undefined ? Number(query.page) : 1;
    const limit = query.limit !== undefined ? Number(query.limit) : 10;

    if (Number.isNaN(page) || page < 1) {
      throw createHttpError('El parámetro page debe ser mayor o igual a 1', 400);
    }
    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      throw createHttpError('El parámetro limit debe estar entre 1 y 100', 400);
    }

    let sort = { date: 1 };
    if (query.sort) {
      const desc = query.sort.startsWith('-');
      const field = desc ? query.sort.slice(1) : query.sort;
      if (!SORTABLE_FIELDS.includes(field)) {
        throw createHttpError(`Campo de ordenamiento inválido. Permitidos: ${SORTABLE_FIELDS.join(', ')}`, 400);
      }
      sort = { [field]: desc ? -1 : 1 };
    }

    const skip = (page - 1) * limit;
    const { docs, total } = await this.repository.getPaginatedEvents(filter, { skip, limit, sort });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: docs.map(formatEvent),
      page,
      limit,
      total,
      totalPages
    };
  }

  async getEventById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError('ID de evento inválido', 400);
    }

    const event = await this.repository.getEventById(id, { populateOrganizer: true });
    if (!event) {
      throw createHttpError('Evento no encontrado', 404);
    }

    return formatEvent(event);
  }

  async createEvent(eventData, organizerId) {
    const { title, description, category, sportType, date, location, capacity, price, status } = eventData;

    if (!title || !description || !category || !location || !date || capacity === undefined) {
      throw createHttpError('Faltan campos obligatorios: title, description, category, location, date, capacity', 400);
    }

    const parsedDate = parseFutureDate(date);
    const parsedCapacity = validateCapacity(capacity);
    const parsedPrice = price !== undefined ? validatePrice(price) : 0;

    let initialStatus = 'published';
    if (status !== undefined) {
      if (!['draft', 'published'].includes(status)) {
        throw createHttpError('Al crear, el estado solo puede ser draft o published', 400);
      }
      initialStatus = status;
    }

    // organizer siempre se asigna desde el usuario autenticado
    const created = await this.repository.createEvent({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      ...(sportType ? { sportType: sportType.trim() } : {}),
      date: parsedDate,
      location: location.trim(),
      capacity: parsedCapacity,
      price: parsedPrice,
      status: initialStatus,
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

    if (currentUser.role !== 'admin' && existing.organizer?.toString() !== currentUser.id) {
      throw createHttpError('No tenés permisos para modificar este evento', 403);
    }

    if (existing.status === 'cancelled' || existing.status === 'finished') {
      throw createHttpError(`No se puede modificar un evento en estado ${existing.status}`, 400);
    }

    const allowedFields = ['title', 'description', 'category', 'sportType', 'location', 'date', 'capacity', 'price'];
    const payload = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        payload[field] = typeof updateData[field] === 'string' ? updateData[field].trim() : updateData[field];
      }
    }

    if (payload.date !== undefined) {
      payload.date = parseFutureDate(payload.date);
    }

    if (payload.capacity !== undefined) {
      payload.capacity = validateCapacity(payload.capacity);
    }

    if (payload.price !== undefined) {
      payload.price = validatePrice(payload.price);
    }

    if (Object.keys(payload).length === 0) {
      throw createHttpError('No se enviaron campos válidos para actualizar', 400);
    }

    const updated = await this.repository.updateEvent(id, payload);
    return formatEvent(updated);
  }

  async updateEventStatus(id, newStatus, currentUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError('ID de evento inválido', 400);
    }

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      throw createHttpError(`Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const existing = await this.repository.getEventById(id);
    if (!existing) {
      throw createHttpError('Evento no encontrado', 404);
    }

    if (currentUser.role !== 'admin' && existing.organizer?.toString() !== currentUser.id) {
      throw createHttpError('No tenés permisos para cambiar el estado de este evento', 403);
    }

    if (existing.status === 'cancelled') {
      throw createHttpError('No se puede cambiar el estado de un evento cancelado', 400);
    }

    if (existing.status === 'finished') {
      throw createHttpError('No se puede cambiar el estado de un evento finalizado', 400);
    }

    const updated = await this.repository.updateEvent(id, { status: newStatus });
    return formatEvent(updated);
  }

  async cancelEvent(id, currentUser) {
    return this.updateEventStatus(id, 'cancelled', currentUser);
  }
}

export const eventsService = new EventsService(eventsRepository);
export default eventsService;
