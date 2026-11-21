import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  cancelEvent
} from '../controllers/events.controller.js';
import { enrollInEvent, getEventTickets } from '../controllers/tickets.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post('/', auth, authorize('organizer', 'admin'), createEvent);
router.put('/:id', auth, authorize('organizer', 'admin'), updateEvent);
router.patch('/:id/status', auth, authorize('organizer', 'admin'), updateEventStatus);
router.patch('/:id/cancel', auth, authorize('organizer', 'admin'), cancelEvent);
router.delete('/:id', auth, authorize('organizer', 'admin'), cancelEvent);

// Rutas de tickets asociadas a un evento
router.post('/:eid/tickets', auth, enrollInEvent);
router.get('/:eid/tickets', auth, authorize('organizer', 'admin'), getEventTickets);

export default router;
