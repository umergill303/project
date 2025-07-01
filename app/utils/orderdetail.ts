export const calculateTotalPrice = (order: Order): number => {
  if (!order) return 0

  return (order.salePrice ?? 0) - (order.discount ?? 0) + (order.shippingCost ?? 0)
}
