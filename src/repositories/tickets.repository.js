import ticketsDAO from '../dao/tickets.dao.js';

class TicketRepository {
  constructor(dao) {
    this.dao = dao;
  }

  isValidId(id) {
    return this.dao.isValidId(id);
  }

  async createTicket(ticketData) {
    return await this.dao.create(ticketData);
  }

  async findTicketById(id) {
    return await this.dao.findById(id);
  }

  async findTicketsByUser(userId) {
    return await this.dao.findAll({ user: userId }, { populateEvent: true });
  }

  async findTicketsByEvent(eventId) {
    return await this.dao.findAll({ event: eventId }, { populateUser: true });
  }

  async findActiveTicket(userId, eventId) {
    return await this.dao.findOne({
      user: userId,
      event: eventId,
      status: { $in: ['confirmed', 'pending'] }
    });
  }

  async countActiveTickets(eventId) {
    return await this.dao.aggregateOccupiedQuantity(eventId);
  }

  async cancelTicket(id) {
    return await this.dao.update(id, {
      status: 'cancelled',
      cancelledAt: new Date()
    });
  }
}

export const ticketsRepository = new TicketRepository(ticketsDAO);
export default ticketsRepository;
