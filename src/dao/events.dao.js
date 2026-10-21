import EventModel from '../models/Event.js';

class EventsDAO {
  async getAll() {
    return await EventModel.find().lean();
  }

  async getById(id) {
    return await EventModel.findById(id).lean();
  }

  async create(eventData) {
    return await EventModel.create(eventData);
  }
}

export const eventsDAO = new EventsDAO();
export default eventsDAO;
