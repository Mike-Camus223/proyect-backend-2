import ticketsDAO from '../dao/tickets.dao.js';

class TicketsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async createTicket(ticketData) {
    return await this.dao.create(ticketData);
  }

  async getTicketById(id) {
    return await this.dao.getById(id);
  }

  async getTicketsByUser(userId) {
    return await this.dao.getByUser(userId);
  }

  async getTicketsByEvent(eventId) {
    return await this.dao.getByEvent(eventId);
  }

  async findActiveTicket(userId, eventId) {
    return await this.dao.findActiveByUserAndEvent(userId, eventId);
  }

  async getOccupiedCapacity(eventId) {
    return await this.dao.getOccupiedQuantityByEvent(eventId);
  }

  async updateTicket(id, updateData) {
    return await this.dao.update(id, updateData);
  }
}

export const ticketsRepository = new TicketsRepository(ticketsDAO);
export default ticketsRepository;
