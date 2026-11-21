import mongoose from 'mongoose';
import TicketModel from '../models/Ticket.js';

class TicketDAO {
  isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async create(ticketData) {
    return await TicketModel.create(ticketData);
  }

  async findById(id) {
    return await TicketModel.findById(id).lean();
  }

  async findOne(filter) {
    return await TicketModel.findOne(filter).lean();
  }

  async findAll(filter = {}, { populateEvent = false, populateUser = false } = {}) {
    const query = TicketModel.find(filter).sort({ createdAt: -1 });
    if (populateEvent) {
      query.populate('event', 'title date location status');
    }
    if (populateUser) {
      query.populate('user', 'first_name last_name email');
    }
    return await query.lean();
  }

  async update(id, updateData) {
    return await TicketModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).lean();
  }

  async count(filter = {}) {
    return await TicketModel.countDocuments(filter);
  }

  async aggregateOccupiedQuantity(eventId) {
    const result = await TicketModel.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
          status: { $in: ['confirmed', 'pending'] }
        }
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    return result[0]?.totalQuantity || 0;
  }
}

export const ticketsDAO = new TicketDAO();
export default ticketsDAO;
