const cron = require('node-cron');
const IssuedBook = require('../models/IssuedBook');
const User = require('../models/User');
const notificationService = require('./notificationService');
const reservationService = require('./reservationService');

function startScheduler() {
  const expr = process.env.CRON_OVERDUE || '0 9 * * *'; // default 09:00 every day
  if (!/^\S+\s+\S+\s+\S+\s+\S+\s+\S+$/.test(expr)) {
    throw new Error('Invalid CRON_OVERDUE expression');
  }
  cron.schedule(expr, async () => {
    const now = new Date();
    const overdue = await IssuedBook.find({ status: 'issued', expectedReturnDate: { $lt: now } }).populate('book reader');
    for (const loan of overdue) {
      if (loan.reader) await notificationService.sendOverdueReminder(loan.reader, loan);
    }
  });

  // Every 30 minutes release expired reservations
  cron.schedule('*/30 * * * *', async () => {
    try { await reservationService.releaseExpiredReservations(); } catch (e) { /* ignore */ }
  });
}

module.exports = { startScheduler };
