const Reservation = require('../models/Reservation');
const { createError } = require('../utils/errors');

exports.list = async (req, res) => {
  const { book, reader, status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (book) filter.book = book;
  if (reader) filter.reader = reader;
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Reservation.find(filter).populate('book reader').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Reservation.countDocuments(filter),
  ]);
  res.json({ items, page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) });
};

exports.cancel = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const resv = await Reservation.findById(id);
  if (!resv) throw createError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found');
  if (resv.status !== 'pending') return res.json({ message: 'No action', reservation: resv });
  resv.status = 'cancelled';
  if (reason) resv.cancelReason = reason.slice(0, 300);
  await resv.save();
  res.json({ message: 'Cancelled', reservation: resv });
};

exports.listMine = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { reader: req.user._id };
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Reservation.find(filter).populate('book reader').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Reservation.countDocuments(filter),
  ]);
  res.json({ items, page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) });
};
