export const formatCurrency = (price: number) => {
  if (price === null || price === undefined) return ''

  const config = useRuntimeConfig().public.ecommerce
  const isWhole = price % 1 === 0
  const adjustedPrice = (isWhole && price > 0) ? price - 0.01 : price

  return new Intl.NumberFormat(`en-${config.countryCode}`, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(adjustedPrice).replace(config.currency, '')
}
