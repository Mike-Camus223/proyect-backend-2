import eventsDAO from '../dao/events.dao.js';

class EventsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getEvents(filter = {}) {
    return await this.dao.getAll(filter);
  }

  async getEventById(id) {
    return await this.dao.getById(id);
  }

  async createEvent(eventData) {
    return await this.dao.create(eventData);
  }

  async updateEvent(id, updateData) {
    return await this.dao.update(id, updateData);
  }

  async deleteEvent(id) {
    return await this.dao.delete(id);
  }
}

export const eventsRepository = new EventsRepository(eventsDAO);
export default eventsRepository;
