import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { config } from './env.config.js';
import sessionsService from '../services/sessions.service.js';

/**
 * Extrae el token JWT desde la cookie HTTP Only 'currentUser'.
 */
const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.currentUser || null;
  }
  return null;
};

/**
 * Inicializa y centraliza las estrategias de Passport.js.
 * Esta estructura permite agregar futuros providers externos (Google, GitHub, etc.)
 * directamente aqui sin necesidad de modificar app.js.
 */
export const initializePassport = () => {
  // Estrategia local para registro de usuarios
  passport.use(
    'register',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password'
      },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name } = req.body;
          const newUser = await sessionsService.registerUser({
            first_name,
            last_name,
            email,
            password
          });
          return done(null, newUser);
        } catch (error) {
          if (error.statusCode) {
            return done(null, false, {
              message: error.message,
              statusCode: error.statusCode
            });
          }
          return done(error);
        }
      }
    )
  );

  // Estrategia local para login (solo valida credenciales; el controller genera el JWT)
  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await sessionsService.validateCredentials({ email, password });
          return done(null, user);
        } catch (error) {
          if (error.statusCode) {
            return done(null, false, {
              message: error.message,
              statusCode: error.statusCode
            });
          }
          return done(error);
        }
      }
    )
  );

  // Estrategia JWT para validar la cookie currentUser en rutas protegidas
  passport.use(
    'current',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.jwtSecret
      },
      async (jwtPayload, done) => {
        try {
          if (!jwtPayload || !jwtPayload.id || !jwtPayload.email) {
            return done(null, false, { message: 'No autenticado' });
          }

          return done(null, {
            id: jwtPayload.id,
            email: jwtPayload.email,
            role: jwtPayload.role
          });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Preparado para sumar providers externos (Google, GitHub, etc.) sin tocar app.js:
  // passport.use('google', new GoogleStrategy({ ... }, async (accessToken, refreshToken, profile, done) => { ... }));
  // passport.use('github', new GitHubStrategy({ ... }, async (accessToken, refreshToken, profile, done) => { ... }));
};

export default initializePassport;
