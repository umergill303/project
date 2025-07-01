export default defineEventHandler(async event => {
  try {
    const form = await readFormData(event)
    const entries: Record<string, string> = {}

    for (const [key, value] of form.entries()) {
      if (!(value instanceof File)) {
        entries[key] = value.toString()
      }
    }

    await Promise.all(
      Object.entries(entries).map(([key, value]) =>
        useDb().insert(tables.pageSeo).values({ key, value })
          .onConflictDoUpdate({ target: tables.pageSeo.key, set: { value } })
      )
    )

    return { success: true, message: 'Page SEO updated successfully' }
  }
  catch (error) {
    console.error('[PATCH API] Page SEO update failed', error)
    return { success: false, message: error }
  }
})
