import nodemailer from 'nodemailer';
import { getTransporter } from '../config/mailer.config.js';
import { config } from '../config/env.config.js';

class MailService {
  /**
   * Envia un email de confirmacion de inscripcion mediante Nodemailer.
   */
  async sendTicketConfirmation({ to, eventTitle, eventDate, eventLocation, quantity, reservationCode }) {
    const transporter = await getTransporter();
    const formattedDate = new Date(eventDate).toLocaleString('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const mailOptions = {
      from: config.mail.from,
      to,
      subject: `Confirmación de inscripción - ${eventTitle} (${reservationCode})`,
      text: `Tu inscripción fue confirmada.\n\nEvento: ${eventTitle}\nFecha: ${formattedDate}\nUbicación: ${eventLocation}\nCantidad de lugares: ${quantity}\nCódigo de reserva: ${reservationCode}`,
      html: `
        <h2>Inscripción confirmada</h2>
        <p>Tu reserva para el evento <strong>${eventTitle}</strong> quedó confirmada.</p>
        <ul>
          <li><strong>Código de reserva:</strong> ${reservationCode}</li>
          <li><strong>Fecha:</strong> ${formattedDate}</li>
          <li><strong>Ubicación:</strong> ${eventLocation}</li>
          <li><strong>Entradas / Cupos:</strong> ${quantity}</li>
        </ul>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Vista previa del email enviado (${reservationCode}): ${previewUrl}`);
    }

    return info;
  }
}

export const mailService = new MailService();
export default mailService;
