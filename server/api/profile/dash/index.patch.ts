import type { User } from '~~/server/database/schema'

export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const session = await getUserSession(event)
    const userId = (session?.user as User & { id: string })?.id

    const form = await readFormData(event)
    const file = form.get('file') as File | null
    const data = JSON.parse(form.get('data') as string)

    const existingUser = await db.select()
      .from(tables.users).where(eq(tables.users.id, userId)).get()

    let newAvatar = existingUser?.avatar ?? null
    if (file && file.size > 0) {
      ensureBlob(file, { maxSize: '8MB', types: ['image'] })
      newAvatar = (await hubBlob().put(`user-avatar/${file.name}`, file, { addRandomSuffix: true })).pathname
      if (existingUser?.avatar && existingUser.avatar !== newAvatar) {
        await hubBlob().del(existingUser.avatar.replace(/^\/+/, ''))
      }
    }

    const updatedUser = await db.update(tables.users)
      .set({ ...data, avatar: newAvatar }).where(eq(tables.users.id, userId)).returning().get()

    return { success: true, message: 'Profile updated successfully!', user: updatedUser }
  }
  catch (error) {
    console.error('[PATCH user] Error:', error)
    throw createError({ statusCode: 500, message: 'Failed to update profile' })
  }
})
