export const getDiscountedU = (salePrice, discount) => {
  salePrice = Number(salePrice) || 0
  discount = Number(discount) || 0

  const discountedPrice = salePrice - (discount / 100) * salePrice
  return parseFloat(discountedPrice.toFixed(2))
}
