import eventsService from '../services/events.service.js';

export const getEvents = async (req, res, next) => {
  try {
    const result = await eventsService.getAllEvents(req.query);
    return res.status(200).json({
      status: 'success',
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    });
  } catch (error) {
    return next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventsService.getEventById(req.params.id);
    return res.status(200).json({
      status: 'success',
      payload: event
    });
  } catch (error) {
    return next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const created = await eventsService.createEvent(req.body, req.user.id);
    return res.status(201).json({
      status: 'success',
      payload: created
    });
  } catch (error) {
    return next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const updated = await eventsService.updateEvent(req.params.id, req.body, req.user);
    return res.status(200).json({
      status: 'success',
      payload: updated
    });
  } catch (error) {
    return next(error);
  }
};

export const updateEventStatus = async (req, res, next) => {
  try {
    const updated = await eventsService.updateEventStatus(req.params.id, req.body.status, req.user);
    return res.status(200).json({
      status: 'success',
      payload: updated
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelEvent = async (req, res, next) => {
  try {
    const cancelled = await eventsService.cancelEvent(req.params.id, req.user);
    return res.status(200).json({
      status: 'success',
      message: 'Evento cancelado',
      payload: cancelled
    });
  } catch (error) {
    return next(error);
  }
};
