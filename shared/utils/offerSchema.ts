import * as z from 'zod'

export const offerSchema = z.object({
  name: z.string().min(3, 'Too short'),
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  description: z.string().min(12, 'Description must be at least 12 characters'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
}).superRefine((data, ctx) => {
  if (new Date(data.endDate) <= new Date(data.startDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End date must be after start date',
      path: ['endDate']
    })
  }
})
