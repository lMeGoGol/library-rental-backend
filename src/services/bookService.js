const Book = require('../models/Book');
const { createError } = require('../utils/errors');

class BookService {
  async create(data) {
    const book = await Book.create(data);
    return book;
  }

  async list({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', q, genre, available } = {}) {
    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
      ];
    }
    if (genre) filter.genre = genre;
    if (typeof available === 'boolean') filter.available = available;

    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Book.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Book.countDocuments(filter),
    ]);

    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }

  async get(id) {
    const item = await Book.findById(id);
    if (!item) throw createError(404, 'BOOK_NOT_FOUND', 'Book not found');
    return item;
  }

  async update(id, data) {
  const item = await Book.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!item) throw createError(404, 'BOOK_NOT_FOUND', 'Book not found');
    return item;
  }

  async remove(id) {
    await Book.findByIdAndDelete(id);
  }
}

module.exports = new BookService();
