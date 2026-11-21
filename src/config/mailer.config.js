import nodemailer from 'nodemailer';
import { config } from './env.config.js';

let cachedTransporter = null;

/**
 * Crea y devuelve el transporter de Nodemailer usando variables de entorno.
 * Si no hay credenciales SMTP configuradas en el entorno local, utiliza jsonTransport
 * para evitar errores en pruebas locales sin exponer ni hardcodear credenciales.
 */
export const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (config.mail.host && config.mail.user && config.mail.pass) {
    cachedTransporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass
      }
    });
  } else {
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }

  return cachedTransporter;
};

export default getTransporter;

