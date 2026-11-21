import EventModel from '../models/Event.js';

class EventsDAO {
  async getAll(filter = {}) {
    return await EventModel.find(filter).lean();
  }

  async getPaginated(filter = {}, { skip = 0, limit = 10, sort = { date: 1 } } = {}) {
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

  async getById(id, { populateOrganizer = false } = {}) {
    const query = EventModel.findById(id);
    if (populateOrganizer) {
      query.populate('organizer', 'first_name last_name email');
    }
    return await query.lean();
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
}

export const eventsDAO = new EventsDAO();
export default eventsDAO;
