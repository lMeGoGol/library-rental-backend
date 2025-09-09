const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
const IssuedBook = require('../models/IssuedBook');
const { discountPercent, calcTotal, calcPenalty, PENALTY_PER_DAY } = require('../utils/pricing');
const { createError } = require('../utils/errors');
const Reservation = require('../models/Reservation');
const reservationService = require('./reservationService');

class LoanService {
  daysFromDueDate(dueDate) {
    if (!dueDate) return 0;
    const today = new Date();
    const end = new Date(dueDate);
    const ms = end.getTime() - today.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  async issuePreview({ userId, bookId, days, dueDate }) {
    const user = await User.findById(userId).lean();
    const book = await Book.findById(bookId).lean();
    if (!user) throw createError(400, 'USER_NOT_FOUND', 'User not found');
    if (!book) throw createError(400, 'BOOK_NOT_FOUND', 'Book not found');
    const d = days ?? this.daysFromDueDate(dueDate);
    const clamped = Math.max(1, Math.min(60, Number(d) || 0));
    const discount = discountPercent(user.discountCategory);
    const totalRent = calcTotal(book.rentPrice, clamped, discount);
    return {
      days: clamped,
      discountPercent: discount,
      rentPerDay: book.rentPrice,
      totalRent,
      deposit: book.deposit,
      payableNow: totalRent + book.deposit,
      expectedReturnDate: new Date(Date.now() + clamped * 24 * 60 * 60 * 1000),
    };
  }

  async issue({ userId, bookId, days, dueDate }) {
    if (!days && dueDate) {
      const d = this.daysFromDueDate(dueDate);
      days = Math.max(1, Math.min(60, Number(d) || 0));
    }
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
  const reader = await User.findById(userId).session(session);
        if (!reader) throw createError(400, 'USER_NOT_FOUND', 'User not found');
  if (reader.role !== 'reader') throw createError(400, 'NOT_READER', 'Only readers can receive loans');

        const MAX_ACTIVE_LOANS = Number(process.env.MAX_ACTIVE_LOANS || 5);
        const activeCount = await IssuedBook.countDocuments({ reader: reader._id, status: 'issued' }).session(session);
        if (activeCount >= MAX_ACTIVE_LOANS) throw createError(400, 'ACTIVE_LIMIT_REACHED', 'Active loans limit reached');
        const sameActive = await IssuedBook.exists({ reader: reader._id, book: bookId, status: 'issued' }).session(session);
        if (sameActive) throw createError(400, 'ALREADY_BORROWED', 'You already have this book issued');

        let book = await Book.findOneAndUpdate(
          { _id: bookId, availableCount: { $gt: 0 } },
          [
            { $set: { availableCount: { $subtract: ["$availableCount", 1] } } },
            { $set: { available: { $gt: ["$availableCount", 0] } } }
          ],
          { new: true, session }
        );
        if (!book) {
          const exists = await Book.exists({ _id: bookId }).session(session);
          if (!exists) throw createError(400, 'BOOK_NOT_FOUND', 'Book not found');
          const res = await reservationService.create({ bookId, readerId: reader._id, desiredDays: days });
          throw createError(400, 'BOOK_UNAVAILABLE', `Book unavailable. Added to queue with id ${res.id}`);
        }

        const expectedReturnDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const discount = discountPercent(reader.discountCategory);
        const totalRent = calcTotal(book.rentPrice, days, discount);

  const loan = await IssuedBook.create([
          {
            book: book._id,
            reader: reader._id,
            issueDate: new Date(),
            expectedReturnDate,
            rentPerDay: book.rentPrice,
            days,
            discountCategory: reader.discountCategory,
            discountPercent: discount,
            totalRent,
            deposit: book.deposit,
            status: 'issued',
          }
        ], { session });

        const created = Array.isArray(loan) ? loan[0] : loan;
        result = { loan: created, payableNow: created.totalRent + created.deposit };
      });
      return result;
    } finally {
      session.endSession();
    }
  }

  async returnLoan(id, { damaged = false, damageFee = 0, damageLevel } = {}) {
    const session = await mongoose.startSession();
    try {
      let response;
      await session.withTransaction(async () => {
        const loan = await IssuedBook.findById(id).session(session);
        if (!loan) throw createError(404, 'LOAN_NOT_FOUND', 'Loan not found');
        if (loan.status === 'returned') throw createError(400, 'ALREADY_RETURNED', 'Already returned');

        const book = await Book.findById(loan.book).session(session);
        if (!book) throw createError(400, 'BOOK_NOT_FOUND', 'Book not found');

        loan.actualReturnDate = new Date();
        loan.penalty = calcPenalty(loan.expectedReturnDate, loan.actualReturnDate);
        if (damageLevel) {
          const { damageFeeForLevel } = require('../utils/pricing');
          const mapped = damageFeeForLevel(damageLevel);
          loan.damageFee = damageLevel === 'none' ? 0 : mapped;
        } else {
          loan.damageFee = damaged ? Math.max(0, Number(damageFee) || 0) : 0;
        }
        loan.status = 'returned';
        book.availableCount = Math.max(0, (book.availableCount || 0) + 1);

        await Promise.all([
          loan.save({ session }),
          book.save({ session })
        ]);

        const depositBack = Math.max(0, loan.deposit - loan.penalty - loan.damageFee);
        const extraToPay = Math.max(0, loan.penalty + loan.damageFee - loan.deposit);

        const pending = await reservationService.nextPendingForBook(book._id, session);
        if (pending) {
          const updated = await Book.findOneAndUpdate(
            { _id: book._id, availableCount: { $gt: 0 } },
            [
              { $set: { availableCount: { $subtract: ["$availableCount", 1] } } },
              { $set: { available: { $gt: ["$availableCount", 0] } } }
            ],
            { new: true, session }
          );
          if (updated) {
            await reservationService.markFulfilled(pending, session);
          }
        }

  response = { loan: await loan.populate(['book', 'reader']), settlement: { depositPaid: loan.deposit, penalty: loan.penalty, damageFee: loan.damageFee, depositReturned: depositBack, extraToPay }, queuedNext: !!pending };
      });
      return response;
    } finally {
      session.endSession();
    }
  }

  async renew(id, { extraDays = 0 }) {
    const session = await mongoose.startSession();
    try {
      let out;
      await session.withTransaction(async () => {
        const loan = await IssuedBook.findById(id).session(session);
        if (!loan) throw createError(404, 'LOAN_NOT_FOUND', 'Loan not found');
        if (loan.status !== 'issued') throw createError(400, 'NOT_ACTIVE', 'Loan is not active');

        const MAX_RENEWS = Number(process.env.MAX_RENEWS || 2);
        if (loan.renewals >= MAX_RENEWS) throw createError(400, 'RENEW_LIMIT', 'Renew limit reached');

        const pending = await Reservation.exists({ book: loan.book, status: 'pending' }).session(session);
        if (pending) throw createError(400, 'RESERVED_WAITLIST', 'Renewal not allowed: waitlist exists');

        const reader = await User.findById(loan.reader).session(session);
        const discount = discountPercent(reader?.discountCategory);

        const addDays = Math.max(0, Number(extraDays) || 0);
        loan.days += addDays;
        loan.expectedReturnDate = new Date(loan.expectedReturnDate.getTime() + addDays * 24 * 60 * 60 * 1000);
        loan.totalRent = calcTotal(loan.rentPerDay, loan.days, discount);
        loan.renewals += 1;
        await loan.save({ session });
        out = await loan.populate(['book', 'reader']);
      });
      return out;
    } finally {
      session.endSession();
    }
  }

  async listForUser(user, { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', status, reader, book } = {}) {
    const filter = {};
    if (user.role === 'reader') {
      filter.reader = user.id;
    } else {
      if (reader) filter.reader = reader;
    }
    if (book) filter.book = book;
    if (status) filter.status = status;
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const q = IssuedBook.find(filter).populate('book reader').sort(sort).skip(skip).limit(limit).lean();
    const [items, total] = await Promise.all([
      q,
      IssuedBook.countDocuments(filter),
    ]);
    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }

  async getById(user, id) {
    const loan = await IssuedBook.findById(id).populate('book reader').lean();
    if (!loan) throw createError(404, 'LOAN_NOT_FOUND', 'Loan not found');
    if (user.role === 'reader' && loan.reader._id.toString() !== user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Forbidden');
    }
    return loan;
  }

  async previewReturn(id) {
    const loan = await IssuedBook.findById(id);
    if (!loan) throw createError(404, 'LOAN_NOT_FOUND', 'Loan not found');
    if (loan.status === 'returned') return { alreadyReturned: true };
    const now = new Date();
    const penalty = calcPenalty(loan.expectedReturnDate, now);
    return { penalty, penaltyPerDay: PENALTY_PER_DAY };
  }

  async listOverdue(user, { page = 1, limit = 10, days = 0, reader } = {}) {
    if (!['admin','librarian'].includes(user.role)) throw createError(403, 'FORBIDDEN', 'Forbidden');
    const now = new Date();
    const threshold = days > 0 ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;
    const filter = { status: 'issued', expectedReturnDate: { $lt: now } };
    if (reader) filter.reader = reader;
    if (threshold) {
      filter.expectedReturnDate = { $lt: threshold };
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      IssuedBook.find(filter).populate('book reader').sort({ expectedReturnDate: 1 }).skip(skip).limit(limit).lean(),
      IssuedBook.countDocuments(filter),
    ]);
    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }
}

module.exports = new LoanService();
