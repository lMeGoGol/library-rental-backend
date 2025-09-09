const { z } = require('zod');

const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  thumbnailUrl: z.string().min(1).optional(),
  deposit: z.coerce.number().nonnegative(),
  rentPrice: z.coerce.number().positive(),
  genre: z.string().min(1),
  quantity: z.coerce.number().int().min(0).default(1).optional(),
  availableCount: z.coerce.number().int().min(0).optional(),
});

const updateBookSchema = createBookSchema.partial().extend({
  available: z.boolean().optional(),
});

module.exports = { createBookSchema, updateBookSchema };
