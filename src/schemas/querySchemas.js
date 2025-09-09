const { z } = require('zod');

const sortOrder = z.enum(['asc', 'desc']).default('desc');
const pageSchema = z.coerce.number().int().min(1).default(1);
const limitSchema = z.coerce.number().int().min(1).max(100).default(10);

const booksListQuerySchema = z.object({
  page: pageSchema.optional(),
  limit: limitSchema.optional(),
  sortBy: z.enum(['createdAt', 'title', 'author', 'genre', 'rentPrice']).default('createdAt').optional(),
  order: sortOrder.optional(),
  q: z.string().trim().min(1).optional(),
  genre: z.string().trim().min(1).optional(),
  available: z.coerce.boolean().optional(),
});

const usersListQuerySchema = z.object({
  page: pageSchema.optional(),
  limit: limitSchema.optional(),
  sortBy: z.enum(['createdAt', 'username', 'role']).default('createdAt').optional(),
  order: sortOrder.optional(),
  q: z.string().trim().min(1).optional(),
  role: z.enum(['admin', 'librarian', 'reader']).optional(),
});

const loansListQuerySchema = z.object({
  page: pageSchema.optional(),
  limit: limitSchema.optional(),
  sortBy: z.enum(['createdAt', 'issueDate', 'expectedReturnDate', 'status']).default('createdAt').optional(),
  order: sortOrder.optional(),
  status: z.enum(['issued', 'returned']).optional(),
  reader: z.string().trim().min(1).optional(),
  book: z.string().trim().min(1).optional(),
});

const loansOverdueQuerySchema = z.object({
  page: pageSchema.optional(),
  limit: limitSchema.optional(),
  days: z.coerce.number().int().min(0).default(0).optional(),
  reader: z.string().trim().min(1).optional(),
});

module.exports = { booksListQuerySchema, usersListQuerySchema, loansListQuerySchema, loansOverdueQuerySchema };
