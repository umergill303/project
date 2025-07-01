// export default defineEventHandler(async event => {
//   const { id } = getRouterParams(event)
//   const data = await readBody(event)

//   await useDb().update(tables.contacts)
//     .set(data).where(eq(tables.contacts.id, id)).returning().get()

//   return { success: true }
// })

export default defineEventHandler(async event => {
  const id = event.context.params?.id

  if (!id) {
    return createError({ statusCode: 400, message: 'ID is required' })
  }

  await useDb().update(tables.contacts).set({ unread: false }).where(eq(tables.contacts.id, id))

  return { success: true }
})
