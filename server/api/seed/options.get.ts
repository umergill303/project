export default defineEventHandler(async () => {
  const db = useDb()

  // 1. Fetch all attributes
  const allAttributes = await db.select().from(tables.attributes)

  // 2. Generate options based on attribute type or name
  const newOptions: typeof allAttributes = []

  allAttributes.forEach(attribute => {
    let values: string[] = []

    // Customize based on attribute name or type
    switch (attribute?.name?.toLowerCase()) {
      case 'size':
        values = ['S', 'M', 'L', 'XL']
        break
      case 'color':
        values = ['Red', 'Blue', 'Green']
        break
      default:
        values = ['Option 1', 'Option 2']
    }

    const options = values.map((value, index) => ({
      name: value,
      order: index + 1,
      attribute: attribute.id,
    }))
    newOptions.push(options)
  })

  // 3. Insert into options table
  await db.insert(tables.options).values(newOptions.flat())

  return {
    status: 'success',
    message: `${newOptions.length} options added to ${allAttributes.length} attributes.`,
  }
})
