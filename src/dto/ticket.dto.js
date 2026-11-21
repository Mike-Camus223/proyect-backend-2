import UserDTO from './user.dto.js';
import EventDTO from './event.dto.js';

export class TicketDTO {
  constructor(ticket) {
    this.id = (ticket._id || ticket.id).toString();
    this.user = ticket.user ? UserDTO.summary(ticket.user) : null;
    this.event = ticket.event ? EventDTO.summary(ticket.event) : null;
    this.status = ticket.status;
    this.quantity = ticket.quantity;
    this.reservationCode = ticket.reservationCode;
    this.cancelledAt = ticket.cancelledAt || null;
    this.createdAt = ticket.createdAt;
  }

  static from(ticket) {
    if (!ticket) return null;
    return new TicketDTO(ticket);
  }

  static fromList(tickets = []) {
    return tickets.map((t) => TicketDTO.from(t));
  }
}

export default TicketDTO;
