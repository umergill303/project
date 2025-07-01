export const calculatePrices = (products: Product[]) => {
  let totalSalePrice = 0
  let totalDiscountPrice = 0
  let totalDiscountedPrice = 0
  let totalShippingPrice = 0
  let TotalPrice = 0

  if (Array.isArray(products) && products.length > 0) {
    totalDiscountedPrice = parseFloat(
      products
        .reduce((sum, product) => {
          return (
            sum
            + (product.salePrice - (product.discount / 100) * product.salePrice)
            * product.qty
          )
        }, 0)
        .toFixed(2)
    )

    totalSalePrice = parseFloat(
      products
        .reduce((sum, product) => {
          return sum + product.salePrice * product.qty
        }, 0)
        .toFixed(2)
    )

    totalDiscountPrice = parseFloat(
      (totalSalePrice - totalDiscountedPrice).toFixed(2)
    )

    totalShippingPrice = parseFloat(
      products
        .reduce((sum, product) => {
          return sum + product.shippingCost * product.qty
        }, 0)
        .toFixed(2)
    )

    TotalPrice = parseFloat(
      (totalShippingPrice + totalDiscountedPrice).toFixed(2)
    )
  }

  return {
    totalSalePrice,
    totalDiscountPrice,
    totalDiscountedPrice,
    totalShippingPrice,
    TotalPrice,
  }
}
