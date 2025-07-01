export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const postMessage = await useDb()
    .insert(tables.contacts)
    .values({
      user: id,
      message: body.message,
    })
    .returning()
    .get()
  return postMessage
})
