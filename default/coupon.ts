import type { Coupon } from '~~/server/utils/drizzle'

export const defaultCoupon: Omit<Coupon, 'id'> = {
  code: '',
  description: '',
  discount: 0,
  minOrderAmount: 0,
  firstOrderOnly: false,
  active: false,
  usageLimit: 0,
  usedCount: 0,
  startDate: '',
  endDate: '',
}
