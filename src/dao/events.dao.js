import EventModel from '../models/Event.js';

class EventsDAO {
  async getAll(filter = {}) {
    return await EventModel.find(filter).lean();
  }

  async getById(id) {
    return await EventModel.findById(id).lean();
  }

  async create(eventData) {
    return await EventModel.create(eventData);
  }

  async update(id, updateData) {
    return await EventModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).lean();
  }

  async delete(id) {
    return await EventModel.findByIdAndDelete(id).lean();
  }
}

export const eventsDAO = new EventsDAO();
export default eventsDAO;
