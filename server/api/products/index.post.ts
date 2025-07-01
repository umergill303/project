export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const form = await readFormData(event)
    const files = form.getAll('files') as File[]
    const ogFile = form.get('ogFile') as File
    const videoFile = form.get('videoFile') as File
    const data = JSON.parse(form.get('data') as string)

    const imageBlob = await Promise.all(
      files.map(async file => {
        ensureBlob(file, { maxSize: '8MB', types: ['image'] })
        return (await hubBlob().put(file.name, file, { addRandomSuffix: true, prefix: 'products-thumbnails' })).pathname
      })
    )

    let ogBlobPath = null
    if (ogFile) {
      ensureBlob(ogFile, { maxSize: '8MB', types: ['image'] })
      const ogBlob = await hubBlob().put(ogFile.name, ogFile, { addRandomSuffix: true, prefix: 'seo-thumbnails' })
      ogBlobPath = ogBlob.pathname
    }

    let videoBlobPath = null
    if (videoFile) {
      ensureBlob(videoFile, { maxSize: '32MB', types: ['video'] })
      const videoBlob = await hubBlob().put(videoFile.name, videoFile, { addRandomSuffix: true, prefix: 'product-videos' })
      videoBlobPath = videoBlob.pathname
    }

    const cate = data.category
      ? await db.select({ name: tables.categories.name })
        .from(tables.categories).where(eq(tables.categories.id, data.category)).then(res => res[0].name || 'CA')
      : 'CA'

    const brand = data.brand
      ? await db.select({ name: tables.brands.name })
        .from(tables.brands).where(eq(tables.brands.id, data.brand)).then(res => res[0].name || 'BR')
      : 'BR'
    const sku = generateSKU(cate, brand)

    return await db.insert(tables.products)
      .values({
        ...data,
        sku: sku,
        ogImg: ogBlobPath,
        video: videoBlobPath,
        thumbnail: JSON.stringify(imageBlob),
        tags: data.tags ? JSON.stringify(data.tags) : '',
        specs: data.specs ? JSON.stringify(data.specs) : '',
        seoTags: data.seoTags ? JSON.stringify(data.seoTags) : ''
      }).returning().get()
  }
  catch {
    throw createError({ statusCode: 500, message: '[product api] Internal Server Error' })
  }
})
