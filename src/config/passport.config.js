import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { config } from './env.config.js';
import sessionsService from '../services/sessions.service.js';
import UserDTO from '../dto/user.dto.js';

const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.currentUser || null;
  }
  return null;
};

/**
 * Inicializa y centraliza las estrategias de Passport.js.
 * Preparado para agregar providers externos (Google, GitHub, etc.) sin tocar app.js.
 */
export const initializePassport = () => {
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

          return done(null, UserDTO.current(jwtPayload));
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};

export default initializePassport;
