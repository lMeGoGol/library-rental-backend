const { z } = require('zod');

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3)
});

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  lastName: z.string().min(1),
  firstName: z.string().min(1),
  middleName: z.string().min(1),
  address: z.string().min(3),
  phone: z.string().regex(/^\+?\d[\d\s-]{7,}$/)
});

module.exports = { loginSchema, registerSchema };
