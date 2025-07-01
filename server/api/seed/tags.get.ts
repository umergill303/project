export default defineEventHandler(async () => {
  console.log('Running DB seed task for tags...')

  const tagData = [
    { name: 'New Arrival' },
    { name: 'Best Seller' },
    { name: 'Limited Edition' },
    { name: 'Discount' },
    { name: 'Popular' },
    { name: 'Trending' },
    { name: 'Exclusive' },
    { name: 'Sale' },
    { name: 'Top Rated' },
    { name: 'Hot Deal' },
  ]

  await useDb().insert(tables.tags).values(tagData)

  return 'All tags added successfully.'
})
