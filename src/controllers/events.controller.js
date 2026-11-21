import eventsService from '../services/events.service.js';

const handleControllerError = (error, res, next) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }
  return next(error);
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getAllEvents();
    return res.status(200).json({
      status: 'success',
      payload: events
    });
  } catch (error) {
    return handleControllerError(error, res, next);
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
    return handleControllerError(error, res, next);
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
    return handleControllerError(error, res, next);
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
    return handleControllerError(error, res, next);
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
    return handleControllerError(error, res, next);
  }
};
