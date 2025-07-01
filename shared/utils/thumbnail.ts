export const getThumbnail = (thumbnail?: string | string[] | null): string[] => {
  if (Array.isArray(thumbnail) && thumbnail.length > 0) {
    return thumbnail
  }
  if (typeof thumbnail === 'string' && thumbnail.trim() !== '') {
    return [thumbnail]
  }
  return ['/Noimage.jpg']
}
