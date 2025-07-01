import type { User } from '~~/server/database/schema'

export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const form = await readFormData(event)

    // Extract fields from form data
    const file = form.get('avatar') as File
    const rawData = form.get('data') as string
    const data = rawData ? JSON.parse(rawData) : {}

    const session = await getUserSession(event)
    const userId = (session?.user as User & { id: string }).id

    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized: User not logged in' })
    }

    if (!data.name || !data.email) {
      throw createError({ statusCode: 400, message: 'Bad Request: Missing required fields' })
    }

    let avatarUrl = data.avatar

    // If a new avatar file is uploaded
    if (file) {
      ensureBlob(file, { maxSize: '8MB', types: ['image'] }) // Validate file
      const blob = await hubBlob().put(file.name, file, { addRandomSuffix: true, prefix: 'user-avatar' })
      avatarUrl = blob.pathname
    }

    // Update the user's profile in the database
    const result = await db.update(tables.users)
      .set({ ...data, avatar: avatarUrl }).where(eq(tables.users.id, userId)).returning()

    return {
      success: true,
      message: 'Profile updated successfully',
      data: result,
    }
  }
  catch (error) {
    console.error('Error updating profile:', error)
    throw createError({ statusCode: 500, message: 'Internal Server Error' })
  }
})
