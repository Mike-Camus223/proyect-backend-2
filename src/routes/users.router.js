import { Router } from 'express';
import { getUsers, getUserById, updateUserRole } from '../controllers/users.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.get('/', auth, authorize('admin'), getUsers);
router.get('/:id', auth, authorize('admin'), getUserById);
router.patch('/:id/role', auth, authorize('admin'), updateUserRole);

export default router;

