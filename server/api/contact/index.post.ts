export default defineEventHandler(async event => {
  const session = await getUserSession(event)
  const res = await readBody(event)
  const userId = session.user?.id
  const db = useDb()

  console.log(res)

  if (!userId) {
    return {
      success: false,
      message: 'User is not authenticated',
    }
  }
  const contact = await db
    .insert(tables.contacts)
    .values({
      user: userId,
      name: res.name,
      phone: res.phone,
      // email: res.email,
      subject: res.subject,
      message: res.message,
    })
    .returning()
  return contact
})
