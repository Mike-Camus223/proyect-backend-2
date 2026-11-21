import eventsDAO from '../dao/events.dao.js';

class EventRepository {
  constructor(dao) {
    this.dao = dao;
  }

  isValidId(id) {
    return this.dao.isValidId(id);
  }

  async findPublishedEvents(filter = {}, options = {}) {
    return await this.dao.findPaginated(filter, options);
  }

  async getPaginatedEvents(filter = {}, options = {}) {
    return this.findPublishedEvents(filter, options);
  }

  async findEventById(id, options = {}) {
    return await this.dao.findById(id, options);
  }

  async getEventById(id, options = {}) {
    return this.findEventById(id, options);
  }

  async createEvent(eventData) {
    return await this.dao.create(eventData);
  }

  async updateEvent(id, updateData) {
    return await this.dao.update(id, updateData);
  }

  async cancelEvent(id) {
    return await this.dao.update(id, { status: 'cancelled' });
  }
}

export const eventsRepository = new EventRepository(eventsDAO);
export default eventsRepository;
