import type { User } from '~~/server/database/schema'

export default defineEventHandler(async event => {
  const session = await getUserSession(event)
  const userId = (session?.user as User & { id: string })?.id

  if (!userId) {
    await clearUserSession(event)
    return null
  }

  const db = useDb()
  const user = await db.select()
    .from(tables.users).where(eq(tables.users.id, userId)).get()

  if (!user) {
    await clearUserSession(event)
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return { ...user,
  }
})
