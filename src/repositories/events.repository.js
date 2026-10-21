import eventsDAO from '../dao/events.dao.js';

class EventsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getEvents() {
    return await this.dao.getAll();
  }

  async getEventById(id) {
    return await this.dao.getById(id);
  }

  async createEvent(eventData) {
    return await this.dao.create(eventData);
  }
}

export const eventsRepository = new EventsRepository(eventsDAO);
export default eventsRepository;
