export default defineEventHandler(async () => {
  try {
    const kv = hubKV()
    await kv.del('dashboard:visitors-analytics')

    const now = Math.floor(Date.now() / 1000)
    await useDb().insert(tables.visitors).values({ timestamp: now, count: 1 })
    return { success: true }
  }
  catch (e) {
    console.error('Visitor track error:', e)
    return { success: false }
  }
})
