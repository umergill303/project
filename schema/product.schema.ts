import * as z from 'zod'

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  purchasePrice: z.number().min(0, 'Price cannot be negative'),
  salePrice: z.number().min(0, 'Price cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  // shippingCost: z.number().min(0, 'Shipping cost cannot be negative'),
  maxShippingProducts: z.number().min(0, 'Max shipping products cannot be negative'),
}).superRefine((val, ctx) => {
  if (val.salePrice < val.purchasePrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Sale price must be ≥ purchase price',
      path: ['salePrice']
    })
  }
  if (val.maxShippingProducts >= val.stock) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Max shipping products must be less than stock',
      path: ['maxShippingProducts']
    })
  }
})
