// shared/utils/couponSchema.ts
import { z } from 'zod'

export const couponSchema = z.object({
  code: z.string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(20, 'Coupon code must be at most 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Coupon code can only contain letters and numbers'),
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  minOrderAmount: z.number()
    .min(0, 'Minimum order amount cannot be negative')
    .optional(),
  usageLimit: z.number()
    .min(1, 'Usage limit must be at least 1')
    .optional(),
  usedCount: z.number()
    .min(0, 'Used count cannot be negative')
    .optional(),
  description: z.string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  active: z.boolean().optional(),
  firstOrderOnly: z.boolean().optional(),

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

export type CouponSchema = z.infer<typeof couponSchema>
