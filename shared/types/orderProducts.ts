export interface OrderProduct {
  id: string
  order: string
  product?: string
  quantity?: number
  salePrice?: number
  discount?: number
  shippingCost?: number
  thumbnail?: string[]
  sku?: string
  name?: string
}
