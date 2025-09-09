const { z } = require('zod');

const createReservationSchema = z.object({
  bookId: z.string().min(1),
  readerId: z.string().min(1).optional(),
  desiredDays: z.coerce.number().int().min(1).max(60),
});

module.exports = { createReservationSchema };
