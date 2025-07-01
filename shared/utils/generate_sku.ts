export const generateSKU = (category: string, brand: string): string => {
  const catCode = category.slice(0, 2).toUpperCase()
  const brandCode = brand.slice(0, 2).toUpperCase()
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `SKU-${catCode}${brandCode}-${randomNum}`
}
