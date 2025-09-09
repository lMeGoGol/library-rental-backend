const { z } = require('zod');

const issueBase = z.object({
  userId: z.string().min(1),
  bookId: z.string().min(1),
  days: z.coerce.number().int().min(1).max(60).optional(),
  dueDate: z.string().trim().min(1).optional(),
}).refine(v => !!v.days || !!v.dueDate, { message: 'Provide days or dueDate' });

const issueLoanSchema = issueBase;
const previewIssueSchema = issueBase;

const returnLoanSchema = z.object({
  damaged: z.boolean().optional(),
  damageFee: z.coerce.number().nonnegative().optional(),
  damageLevel: z.enum(['none','minor','moderate','severe']).optional(),
});
const renewLoanSchema = z.object({
  extraDays: z.coerce.number().int().min(1).max(365),
});

module.exports = { issueLoanSchema, previewIssueSchema, returnLoanSchema, renewLoanSchema };
