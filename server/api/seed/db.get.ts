export default defineEventHandler(async () => {
  try {
    await $fetch('/api/seed/users')
    await $fetch('/api/seed/brands')
    await $fetch('/api/seed/categorys')
    await $fetch('/api/seed/tags')
    await $fetch('/api/seed/products')
    await $fetch('/api/seed/sliders')
    // await $fetch('/api/seed/contacts')
    // await $fetch('/api/seed/about')
    await $fetch('/api/seed/variants')
    // await $fetch('/api/seed/attributes')
    // await $fetch('/api/seed/options')
    // await $fetch('/api/seed/variants')
    // await $fetch('/api/seed/order')
    // await $fetch('/api/seed/orderProduct')
    // await $fetch('/api/seed/returnOrder')
    // await $fetch('/api/seed/offers')
    // await $fetch('/api/seed/visitors')
    return 'DB Seeded successfully.'
  }
  catch (error) {
    console.error('Error in seeding DB:', error)
    throw new Error('Failed to seed the database')
  }
})
