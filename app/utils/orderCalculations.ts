// utils/orderCalculations.ts
import type { ReturnOrderProduct } from '#shared/types/ReturnOrderProduct'

export const calculateSubtotal = (products: ReturnOrderProduct[]): number => {
  return products.reduce((sum, p) => sum + (p.quantity * p.salePrice), 0)
}

export const calculateDiscount = (products: ReturnOrderProduct[]): number => {
  return products.reduce((sum, p) => {
    const totalPrice = p.salePrice * p.quantity
    const discountAmount = totalPrice * (p.discount / 100)
    return sum + discountAmount
  }, 0)
}

export const calculateShipping = (products: ReturnOrderProduct[]): number => {
  return products.reduce((sum, p) => {
    return sum + ((p.shippingCost || 0) * p.quantity)
  }, 0)
}

export const calculateTotal = (products: ReturnOrderProduct[]): number => {
  const subtotal = calculateSubtotal(products)
  const discount = calculateDiscount(products)
  const shipping = calculateShipping(products)
  return subtotal - discount + shipping
}
