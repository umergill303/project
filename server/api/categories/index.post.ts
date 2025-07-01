export default defineEventHandler(async event => {
  try {
    const form = await readFormData(event)
    const file = form.get('file') as File
    const data = JSON.parse(form.get('data') as string)

    ensureBlob(file, { maxSize: '8MB', types: ['image'] })
    const blob = await hubBlob().put(file.name, file, { addRandomSuffix: true, prefix: 'categories-logo' })

    return await useDb().insert(tables.categories).values({ ...data, logo: blob.pathname }).returning().get()
  }
  catch (error) {
    console.log('[Post Api] Category added failed', error)
  }
})
