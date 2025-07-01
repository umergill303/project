export const getDiscountedPrice = (salePrice: number, discount: number): number => {
  const price = Number(salePrice) || 0
  const discountValue = Number(discount) || 0
  return discountValue > 0 ? price - (price * discountValue) / 100 : price
}

export const getOriginalTotalPrice = (salePrice: number, quantity: number): number => {
  const price = Number(salePrice) || 0
  const totalPrice = (Number(quantity) || 1) * price
  return parseFloat(totalPrice.toFixed(2))
}
