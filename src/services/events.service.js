import eventsRepository from '../repositories/events.repository.js';

class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllEvents() {
    return [];
  }

  async getEventById(id) {
    return await this.repository.getEventById(id);
  }

  async createEvent(eventData) {
    return await this.repository.createEvent(eventData);
  }
}

export const eventsService = new EventsService(eventsRepository);
export default eventsService;
