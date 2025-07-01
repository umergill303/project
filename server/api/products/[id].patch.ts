import { generateSKU } from '~~/shared/utils/generate_sku'

export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const { id } = getRouterParams(event)
    const form = await readFormData(event)

    const rawData = form.get('data')
    if (!rawData) throw createError({ statusCode: 400, message: 'Product data is missing' })
    const data = JSON.parse(rawData as string)

    const product = await db.select().from(tables.products).where(eq(tables.products.id, id)).get()
    if (!product) throw createError({ statusCode: 404, message: 'Product not found' })

    const existingImages = product.thumbnail ? JSON.parse(product.thumbnail) : []
    const files = form.getAll('files') as File[]
    const ogFile = form.get('ogFile') as File | null
    const videoFile = form.get('videoFile') as File | null

    let newUploadedImages: string[] = []
    if (files.length > 0) {
      newUploadedImages = await Promise.all(
        files.map(async file => {
          ensureBlob(file, { maxSize: '8MB', types: ['image'] })
          return (await hubBlob().put(file.name, file, { addRandomSuffix: true, prefix: 'products-thumbnails' })).pathname
        })
      )
    }

    let ogBlobPath = product.ogImg
    if (ogFile) {
      ensureBlob(ogFile, { maxSize: '8MB', types: ['image'] })
      const ogBlob = await hubBlob().put(ogFile.name, ogFile, { addRandomSuffix: true, prefix: 'seo-thumbnails' })
      ogBlobPath = ogBlob.pathname

      if (product.ogImg && product.ogImg !== ogBlobPath) {
        try {
          await hubBlob().del(product.ogImg.replace(/^\/+/, ''))
        }
        catch (err) {
          console.error(`Failed to delete old OG image: ${err}`)
        }
      }
    }

    let videoBlobPath = product.video
    if (videoFile) {
      ensureBlob(videoFile, { maxSize: '32MB', types: ['video'] })
      const videoBlob = await hubBlob().put(videoFile.name, videoFile, { addRandomSuffix: true, prefix: 'product-videos' })
      videoBlobPath = videoBlob.pathname

      if (product.video && product.video !== videoBlobPath) {
        try {
          await hubBlob().del(product.video.replace(/^\/+/, ''))
        }
        catch (err) {
          console.error(`Failed to delete old video: ${err}`)
        }
      }
    }

    const updatedThumbnails = data.thumbnail ? JSON.parse(data.thumbnail) : existingImages
    const removedImages = existingImages.filter((img: string) => !updatedThumbnails.includes(img))
    if (removedImages.length > 0) {
      await Promise.all(
        removedImages.map(async (image: string) => {
          try {
            await hubBlob().del(image.replace(/^\/+/, ''))
          }
          catch (err) {
            console.error(`Failed to delete old image from Nuxt Hub: ${err}`)
          }
        })
      )
    }
    const finalImageList = [...updatedThumbnails, ...newUploadedImages]

    const category = data.category
      ? await db.select({ name: tables.categories.name })
          .from(tables.categories).where(eq(tables.categories.id, data.category)).then(res => res[0]?.name || '')
      : 'CA'
    const brand = data.brand
      ? await db.select({ name: tables.brands.name })
          .from(tables.brands).where(eq(tables.brands.id, data.brand)).then(res => res[0]?.name || '')
      : 'BR'
    let sku = generateSKU(category, brand)

    let isUnique = false
    while (!isUnique) {
      const existingProduct = await db.select().from(tables.products).where(eq(tables.products.sku, sku)).get()
      if (!existingProduct) { isUnique = true }
      else { sku = generateSKU(category, brand) }
    }

    return await useDb()
      .update(tables.products)
      .set({
        ...data,
        sku,
        ogImg: ogBlobPath,
        video: videoBlobPath,
        thumbnail: JSON.stringify(finalImageList),
        createdAt: undefined,
        tags: data.tags ? JSON.stringify(data.tags) : '',
        specs: data.specs ? JSON.stringify(data.specs) : '',
        seoTags: data.seoTags ? JSON.stringify(data.seoTags) : '' })
      .where(eq(tables.products.id, id)).returning().get()
  }
  catch (error) {
    console.error('Update error:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal Server Error',
    })
  }
})
