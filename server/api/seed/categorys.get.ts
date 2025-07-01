const categoryData = [
  { name: 'Electronics', featured: true }, // Featured
  { name: 'Fashion', featured: true }, // Featured
  { name: 'Home Appliances', featured: true }, // Featured
  { name: 'Books', featured: true },
  { name: 'Sports', featured: false },
  { name: 'Toys', featured: true },
  { name: 'Groceries', featured: false },
  { name: 'Beauty', featured: false },
  { name: 'Automobiles', featured: false },
  { name: 'Furniture', featured: false },
]

export default defineEventHandler(async () => {
  console.log('Running DB seed task for categories...')

  await useDb().insert(tables.categories).values(categoryData)

  const featuredCount = categoryData.filter(c => c.featured).length
  return `All ${categoryData.length} categories added successfully, with ${featuredCount} marked as featured.`
})
