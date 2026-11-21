import mongoose from 'mongoose';
import EventModel from '../models/Event.js';

class EventDAO {
  isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async findAll(filter = {}) {
    return await EventModel.find(filter).lean();
  }

  async findPaginated(filter = {}, { skip = 0, limit = 10, sort = { date: 1 } } = {}) {
    const [docs, total] = await Promise.all([
      EventModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('organizer', 'first_name last_name email')
        .lean(),
      EventModel.countDocuments(filter)
    ]);

    return { docs, total };
  }

  async findById(id, { populateOrganizer = false } = {}) {
    const query = EventModel.findById(id);
    if (populateOrganizer) {
      query.populate('organizer', 'first_name last_name email');
    }
    return await query.lean();
  }

  async findOne(filter) {
    return await EventModel.findOne(filter).lean();
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

  async count(filter = {}) {
    return await EventModel.countDocuments(filter);
  }
}

export const eventsDAO = new EventDAO();
export default eventsDAO;
