export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  const db = useDb()

  try {
    const contact = await db
      .select({
        id: tables.contacts.id,
        name: tables.contacts.name,
        avatar: tables.users.avatar,
        phone: tables.contacts.phone,
        unread: tables.contacts.unread,
        subject: tables.contacts.subject,
        message: tables.contacts.message,
        createdAt: tables.contacts.createdAt
      })
      .from(tables.contacts)
      .leftJoin(tables.users, eq(tables.users.id, tables.contacts.user))
      .where(eq(tables.contacts.id, id))
      .get()

    if (!contact) {
      throw createError({ statusCode: 404, statusMessage: 'Contact not found' })
    }

    return { contact, success: true }
  }
  catch (err) {
    console.error('Error fetching contact:', err)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
