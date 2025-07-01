export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const session = await getUserSession(event)
    const userId = (session?.user as User & { id: string }).id

    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized: User not logged in' })
    }

    // Fetch the current user to get the existing avatar path
    const user = await db.select().from(tables.users).where(eq(tables.users.id, userId)).limit(1)

    if (!user[0]) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    const avatarPath = user[0].avatar

    // Update the user's avatar to null in the database
    const result = await db.update(tables.users)
      .set({ avatar: null })
      .where(eq(tables.users.id, userId))
      .returning()

    // If there was an avatar, delete it from blob storage
    if (avatarPath) {
      try {
        await hubBlob().delete(avatarPath)
      }
      catch (blobError) {
        console.error('Error deleting avatar from blob storage:', blobError)
        // Continue with success response even if blob deletion fails, as DB is updated
      }
    }

    return {
      success: true,
      message: 'Avatar removed successfully',
      data: result,
    }
  }
  catch (error) {
    console.error('Error removing avatar:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal Server Error'
    })
  }
})
