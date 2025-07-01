import type { User } from '~~/server/database/schema'

export default defineEventHandler(async event => {
  try {
    const form = await readFormData(event)
    const file = form.get('file') as File
    const session = await getUserSession(event)
    const userId = (session?.user as User & { id: string })?.id

    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (!file) {
      throw createError({ statusCode: 400, message: 'No file provided' })
    }

    ensureBlob(file, { maxSize: '8MB', types: ['image'] })
    const blob = await hubBlob().put(file.name, file, { addRandomSuffix: true, prefix: 'user-avatar' })

    const updatedUser = await useDb().update(tables.users)
      .set({ avatar: blob.pathname }).where(eq(tables.users.id, userId))
      .returning({ id: tables.users.id, avatar: tables.users.avatar }).get()

    return { success: true, message: 'Avatar uploaded successfully!', user: updatedUser }
  }
  catch (error) {
    console.error('Error occurred:', error)

    if (error instanceof Error) {
      if (error.message.includes('File validation failed')) {
        throw createError({ statusCode: 400, message: error.message })
      }
    }

    throw createError({ statusCode: 500, message: 'Internal Server Error' })
  }
})
