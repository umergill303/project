export default defineEventHandler(async () => {
  const about = await useDb().select().from(tables.about)

  return about.reduce((acc, abt) => {
    acc[abt.key] = abt.value
    return acc
  }, {} as Record<string, string>)
})
