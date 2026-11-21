import { Router } from 'express';
import passport from 'passport';
import { register, login, current, logout } from '../controllers/sessions.controller.js';
import { passportCallback } from '../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/register',
  (req, res, next) =>
    passport.authenticate(
      'register',
      { session: false },
      passportCallback(req, res, next, 400, 'Faltan campos obligatorios')
    )(req, res, next),
  register
);

router.post(
  '/login',
  (req, res, next) =>
    passport.authenticate(
      'login',
      { session: false },
      passportCallback(req, res, next, 401, 'Credenciales inválidas', true)
    )(req, res, next),
  login
);

router.get(
  '/current',
  (req, res, next) =>
    passport.authenticate(
      'current',
      { session: false },
      passportCallback(req, res, next, 401, 'No autenticado', true)
    )(req, res, next),
  current
);

router.post('/logout', logout);

export default router;
