export default defineEventHandler(async event => {
  try {
    const { id } = getRouterParams(event)
    const form = await readFormData(event)
    const file = form.get('file') as File
    const rawData = form.get('data') as string
    const data = rawData ? JSON.parse(rawData) : {}
    console.log('Parsed form data:', data)

    const db = useDb()
    const user = await db.select().from(tables.users).where(eq(tables.users.id, id)).get()
    if (!user) throw createError({ statusCode: 404, message: 'User not found' })

    if (file && file.size) {
      ensureBlob(file, { maxSize: '8MB', types: ['image'] })
    }

    const blobService = hubBlob()
    const avatarsFolder = 'user-avatar'
    const folderExists = await blobService.list({ prefix: avatarsFolder }).then(res => res.blobs.length > 0)

    if (!folderExists) {
      await blobService.put(`${avatarsFolder}/.keep`, new Blob([]), { metadata: { isFolder: true } })
    }

    let newAvatar = user?.avatar
    if (file && file.size) {
      newAvatar = (await blobService.put(`${avatarsFolder}/${file.name}`, file, { addRandomSuffix: true })).pathname

      if (user.avatar && user.avatar !== newAvatar) {
        await blobService.del(user.avatar.replace(/^\/+/, ''))
      }
    }

    return await db.update(tables.users).set({ ...data, avatar: newAvatar }).where(eq(tables.users.id, id)).returning().get()
  }
  catch (error) {
    console.error('Error updating profile:', error)
    throw createError({ statusCode: 500, message: 'Internal Server Error' })
  }
})
