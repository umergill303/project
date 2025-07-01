export default defineEventHandler(async event => {
  const form = await readFormData(event)
  const file = form.get('file') as File
  const rawData = form.get('data') as string
  const data = rawData ? JSON.parse(rawData) : {}

  ensureBlob(file, { maxSize: '8MB', types: ['image'] })
  const blob = await hubBlob().put(file.name, file, { addRandomSuffix: true, prefix: 'slider-images' })

  return await useDb().insert(tables.slider)
    .values({ ...data, image: blob.pathname }).returning().get()
})
