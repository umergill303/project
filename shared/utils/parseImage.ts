export const parseImage = (image: string | string[] | null | undefined) => {
  if (!image) return null

  try {
    const parsed = typeof image === 'string' ? JSON.parse(image) : image
    if (Array.isArray(parsed)) return parsed[0] || null
    return typeof parsed === 'string' ? parsed : null
  }
  catch { console.log('failed to parse image') }
}
