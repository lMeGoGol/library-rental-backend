const logger = require('../utils/logger');
let transporter = null;
try {
  const nodemailer = require('nodemailer');
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === '1' || process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
} catch (_) { /* nodemailer optional */ }

class NotificationService {
  async sendMail(to, subject, text) {
    if (!transporter || !to) {
      logger.info('notify', `MAIL Fallback: ${subject} -> ${to || 'N/A'} | ${text}`);
      return;
    }
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com',
        to,
        subject,
        text,
      });
    } catch (e) {
      logger.error('notify', 'Mail send failed: ' + e.message);
    }
  }

  async sendOverdueReminder(user, loan) {
    const subject = `Overdue: ${loan.book?.title}`;
    const text = `Hello ${user.username},\n\nYour loan for "${loan.book?.title}" is overdue. Please return it as soon as possible.`;
    await this.sendMail(user.email, subject, text);
  }
  async sendReservationReady(user, book) {
    const subject = `Reservation ready: ${book.title}`;
    const text = `Hello ${user.username},\n\nYour reservation for "${book.title}" is ready. Please visit the library to pick it up.`;
    await this.sendMail(user.email, subject, text);
  }
  async sendReservationExpired(user, book) {
    const subject = `Reservation expired: ${book.title}`;
    const text = `Hello ${user.username},\n\nYour reservation window for "${book.title}" has expired and was released.`;
    await this.sendMail(user.email, subject, text);
  }
}

module.exports = new NotificationService();
