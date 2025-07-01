export default defineEventHandler(async () => {
  console.log('Running DB seed task for about...')

  const fakeStoreData = [
    { key: 'storeName', value: 'Fancy Store' },
    { key: 'contactEmail', value: 'contact@fancystore.com' },
    { key: 'supportEmail', value: 'support@fancystore.com' },
    { key: 'contactPhone', value: '+1 (555) 123-4567' },
    { key: 'address', value: '123 Main St, Anytown, USA' },
    { key: 'googleMapsLink', value: 'https://maps.google.com/?q=123+Main+St' },

  ]

  await useDb().insert(tables.about).values(fakeStoreData)

  return 'All about added successfully.'
})
