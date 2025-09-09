const { z } = require('zod');

const updateUserSchema = z.object({
  lastName: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  middleName: z.string().min(1).optional(),
  address: z.string().min(3).optional(),
  phone: z.string().regex(/^\+?\d[\d\s-]{7,}$/).optional()
});

const setRoleSchema = z.object({ role: z.enum(['admin','librarian','reader']) });
const setDiscountSchema = z.object({ discountCategory: z.enum(['none','student','loyal','pensioner','vip']) });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

// Admin/librarian can change another user's password
const adminChangePasswordSchema = z.object({
  newPassword: z.string().min(6)
});

module.exports = { updateUserSchema, setRoleSchema, setDiscountSchema, changePasswordSchema, adminChangePasswordSchema };
