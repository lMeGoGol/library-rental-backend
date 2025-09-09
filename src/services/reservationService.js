const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const IssuedBook = require('../models/IssuedBook');
const { createError } = require('../utils/errors');

class ReservationService {
  async create({ bookId, readerId, desiredDays }) {
    const book = await Book.findById(bookId);
    if (!book) throw createError(404, 'BOOK_NOT_FOUND', 'Book not found');
    const activeLoan = await IssuedBook.exists({ book: bookId, reader: readerId, status: 'issued' });
    if (activeLoan) throw createError(400, 'ALREADY_BORROWED', 'User already has this book');
    const existing = await Reservation.findOne({ book: bookId, reader: readerId, status: 'pending' });
  if (existing) return existing;
    const res = await Reservation.create({ book: bookId, reader: readerId, desiredDays });
    if (book.availableCount > 0) {
      book.isReserved = true;
      book.reservedUntil = new Date(Date.now() + 24*60*60*1000);
      if (book.quantity === 1) {
        book.availableCount = 0;
        book.available = false;
      }
      await book.save();
    }
    return res;
  }

  async nextPendingForBook(bookId, session) {
    return Reservation.findOne({ book: bookId, status: 'pending' }).sort({ createdAt: 1 }).session(session);
  }

  async markFulfilled(reservation, session) {
    reservation.status = 'fulfilled';
    await reservation.save({ session });
    const book = await Book.findById(reservation.book).session(session);
    if (book) {
      book.isReserved = false;
      book.reservedUntil = null;
      await book.save({ session });
    }
  }

  async cancelForReader(readerId, bookId) {
    await Reservation.updateMany({ reader: readerId, ...(bookId ? { book: bookId } : {}) , status: 'pending' }, { $set: { status: 'cancelled' } });
  }

  async releaseExpiredReservations() {
    const now = new Date();
    const books = await Book.find({ isReserved: true, reservedUntil: { $lt: now } });
    for (const b of books) {
      b.isReserved = false;
      b.reservedUntil = null;
      if (b.quantity === 1) {
        const issued = await IssuedBook.exists({ book: b._id, status: 'issued' });
        if (!issued) {
          b.availableCount = 1;
          b.available = true;
        }
      }
      await b.save();
      const expired = await Reservation.find({ book: b._id, status: 'pending', createdAt: { $lt: now } });
      if (expired.length) {
        await Reservation.updateMany({ _id: { $in: expired.map(r => r._id) } }, { $set: { status: 'cancelled', cancelReason: 'Час броні вичерпано' } });
      }
    }
  }
}

module.exports = new ReservationService();
