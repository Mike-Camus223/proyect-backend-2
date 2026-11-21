import ticketsService from '../services/tickets.service.js';

export const enrollInEvent = async (req, res, next) => {
  try {
    const ticket = await ticketsService.enrollInEvent(req.params.eid, req.body.quantity, req.user);
    return res.status(201).json({
      status: 'success',
      payload: ticket
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await ticketsService.getMyTickets(req.user.id);
    return res.status(200).json({
      status: 'success',
      payload: tickets
    });
  } catch (error) {
    return next(error);
  }
};

export const getEventTickets = async (req, res, next) => {
  try {
    const result = await ticketsService.getEventTickets(req.params.eid, req.user);
    return res.status(200).json({
      status: 'success',
      payload: result
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelTicket = async (req, res, next) => {
  try {
    const updated = await ticketsService.cancelTicket(req.params.tid, req.user);
    return res.status(200).json({
      status: 'success',
      message: 'Ticket cancelado',
      payload: updated
    });
  } catch (error) {
    return next(error);
  }
};
