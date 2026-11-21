import mongoose from 'mongoose';
import TicketModel from '../models/Ticket.js';

class TicketsDAO {
  async create(ticketData) {
    return await TicketModel.create(ticketData);
  }

  async getById(id) {
    return await TicketModel.findById(id).lean();
  }

  async getByUser(userId) {
    return await TicketModel.find({ user: userId })
      .populate('event', 'title date location status')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getByEvent(eventId) {
    return await TicketModel.find({ event: eventId })
      .populate('user', 'first_name last_name email role')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return await TicketModel.findOne({
      user: userId,
      event: eventId,
      status: { $in: ['confirmed', 'pending'] }
    }).lean();
  }

  /**
   * Suma las cantidades de todos los tickets activos (confirmed/pending) de un evento.
   * Los tickets en estado cancelled no ocupan cupo.
   */
  async getOccupiedQuantityByEvent(eventId) {
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

  async update(id, updateData) {
    return await TicketModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).lean();
  }
}

export const ticketsDAO = new TicketsDAO();
export default ticketsDAO;
