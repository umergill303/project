export default defineEventHandler(async event => {
  try {
    const form = await readFormData(event)

    const entries: Record<string, string> = {}

    for (const [key, value] of form.entries()) {
      if (value instanceof File) {
        ensureBlob(value, { maxSize: '8MB', types: ['image'] })
        const blob = await hubBlob().put(value.name, value, { addRandomSuffix: true, prefix: 'store-images' })
        entries[key] = blob.pathname
      }
      else {
        entries[key] = value.toString()
      }
    }

    await Promise.all(
      Object.entries(entries).map(([key, value]) =>
        useDb().insert(tables.about).values({ key, value })
          .onConflictDoUpdate({ target: tables.about.key, set: { value } })
      )
    )

    return { success: true, message: 'About page updated successfully' }
  }
  catch (error) {
    console.error('[PATCH API] About page update failed', error)
    return { success: false, message: error }
  }
})
