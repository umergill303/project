type ProductWithThumbnail = { id?: string, thumbnail?: string | null }
export const formatProductThumbnails = (product: ProductWithThumbnail, event) => {
  const url = getRequestURL(event)
  const baseUrl = `${url.origin}/api/_hub/blob`

  let thumbnails = []
  try {
    thumbnails = product.thumbnail ? JSON.parse(product.thumbnail) : []
  }
  catch (e) {
    console.error('Error parsing thumbnail:', e)
  }

  return { ...product, thumbnail: thumbnails.map((img: string) => `${baseUrl}/${img}`) }
}
