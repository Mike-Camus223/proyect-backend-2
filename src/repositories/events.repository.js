import eventsDAO from '../dao/events.dao.js';

class EventsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getEvents(filter = {}) {
    return await this.dao.getAll(filter);
  }

  async getPaginatedEvents(filter = {}, options = {}) {
    return await this.dao.getPaginated(filter, options);
  }

  async getEventById(id, options = {}) {
    return await this.dao.getById(id, options);
  }

  async createEvent(eventData) {
    return await this.dao.create(eventData);
  }

  async updateEvent(id, updateData) {
    return await this.dao.update(id, updateData);
  }
}

export const eventsRepository = new EventsRepository(eventsDAO);
export default eventsRepository;
