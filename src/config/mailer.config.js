import nodemailer from 'nodemailer';
import { config } from './env.config.js';

let cachedTransporter = null;

/**
 * Devuelve el transporter de Nodemailer usando las credenciales de entorno.
 * Si MAIL_USER/MAIL_PASS no estan definidos en desarrollo, crea una cuenta temporal
 * de Ethereal para pruebas reales y cae a jsonTransport si no hay red.
 */
export const getTransporter = async () => {
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
    return cachedTransporter;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch {
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }

  return cachedTransporter;
};

export default getTransporter;
