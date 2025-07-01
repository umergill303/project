export default defineEventHandler(async () => {
  console.log('Running DB seed task for 10 brands with logos...')

  const brandData = [
    { name: 'Apple' },
    { name: 'Samsung' },
    { name: 'Sony' },
    { name: 'Nike' },
    { name: 'Adidas' },
    { name: 'Microsoft' },
    { name: 'Dell' },
    { name: 'HP' },
    { name: 'Lenovo' },
    { name: 'LG' },
  ]
  await useDb().insert(tables.brands).values(brandData)
  return 'All brands with logos added successfully.'
})
