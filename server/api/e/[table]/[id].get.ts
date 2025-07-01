import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core'

export default defineEventHandler(async event => {
  const tableName = event.context.params?.table as keyof typeof tables

  if (!tableName || typeof tableName !== 'string' || !(tableName in tables)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid table name' })
  }
  const { id } = getRouterParams(event)
  const db = useDb()
  const table = tables[tableName] as SQLiteTableWithColumns<any>
  const query = getQuery(event)
  console.log('queryqueryqueryqueryqueryquery')
  console.log('queryqueryqueryqueryqueryquery')
  console.log('queryqueryqueryqueryqueryquery')
  console.log('queryqueryqueryqueryqueryquery')
  console.log('query', query)

  const options = parseQueryParams(tableName, query)
  console.log('options', options)

  // 1. Determine the final select configuration for Drizzle
  const finalSelectConfig: Record<string, any> = {}

  // Add main table's columns to finalSelectConfig
  if (options.select && options.select.length > 0) {
    options.select.forEach(colKey => {
      if (table[colKey]) {
        finalSelectConfig[colKey] = table[colKey]
      }
      else {
        console.warn(`[API] Column '${colKey}' not found in main table '${tableName}'. It will be ignored.`)
      }
    })
  }
  else {
    // If no specific columns selected for the main table, select all of its own columns
    for (const colName in table) {
      // Ensure it's a Drizzle column object, not a metadata property like '_ DrizzleTable'
      if (table[colName] && typeof table[colName] === 'object' && 'name' in table[colName]) {
        finalSelectConfig[colName] = table[colName]
      }
    }
  }

  // Prepare for joins
  const joinsToApply: Array<{ targetTable: SQLiteTableWithColumns<any>, onCondition: SQL }> = []

  if (options.relations) {
    for (const relationName in options.relations) {
      const relationOption = options.relations[relationName]
      let relatedTableSchemaKey = relationName as keyof typeof tables
      let relatedTableSchema = tables[relatedTableSchemaKey]

      if (!relatedTableSchema) {
        const pluralKey = relationName + 's'
        if (tables[relationName as keyof typeof tables]) {
          relatedTableSchemaKey = relationName as keyof typeof tables
          relatedTableSchema = tables[relatedTableSchemaKey]
        }
        else if (tables[pluralKey as keyof typeof tables]) {
          relatedTableSchemaKey = pluralKey as keyof typeof tables
          relatedTableSchema = tables[relatedTableSchemaKey]
        }
        else if (relationName.endsWith('y')) {
          const iesKey = relationName.slice(0, -1) + 'ies'
          if (tables[iesKey as keyof typeof tables]) {
            relatedTableSchemaKey = iesKey as keyof typeof tables
            relatedTableSchema = tables[relatedTableSchemaKey]
          }
        }
      }
      console.log('relatedTableSchemaKey', relatedTableSchemaKey)
      console.log('relatedTableSchema', relatedTableSchema)
      if (!relatedTableSchema) {
        console.warn(`[API] Schema for related table (key: '${relationName}') not found. Skipping relation.`)
        continue
      }

      let fkColumnInMainTable
      if (table[relationName]) fkColumnInMainTable = table[relationName]
      else if (table[`${relationName}Id`]) fkColumnInMainTable = table[`${relationName}Id`]
      else if (table[`${relationName}_id`]) fkColumnInMainTable = table[`${relationName}_id`]
      else {
        console.warn(`[API] Could not determine FK for relation '${relationName}' on table '${tableName}'. Skipping.`)
        continue
      }

      const pkColumnInRelatedTable = (relatedTableSchema as any).id
      if (!fkColumnInMainTable || !pkColumnInRelatedTable) {
        console.warn(`[API] Essential columns (FK/PK) for join for relation '${relationName}' not found. Skipping.`)
        continue
      }

      joinsToApply.push({ targetTable: relatedTableSchema, onCondition: eq(fkColumnInMainTable, pkColumnInRelatedTable) })
      // Update finalSelectConfig for the relation based on relationOption
      if (relationOption === '*') {
        finalSelectConfig[relationName] = relatedTableSchema // Drizzle nests the whole table object
      }
      else if (Array.isArray(relationOption)) {
        const specificCols: Record<string, any> = {}
        relationOption.forEach(colKey => {
          if ((relatedTableSchema as any)[colKey]) {
            specificCols[colKey] = (relatedTableSchema as any)[colKey]
          }
          else {
            console.warn(`[API] Column '${colKey}' not found in related table '${relatedTableSchemaKey}' for relation '${relationName}'.`)
          }
        })
        if (Object.keys(specificCols).length > 0) {
          finalSelectConfig[relationName] = specificCols // Drizzle nests an object with these specific columns
        }
      }
      else if (typeof relationOption === 'string') { // Single column direct value
        const singleColumnName = relationOption
        if ((relatedTableSchema as any)[singleColumnName]) {
          finalSelectConfig[relationName] = (relatedTableSchema as any)[singleColumnName] // Drizzle selects this column's value directly
        }
        else {
          console.warn(`[API] Column '${singleColumnName}' for direct select not found in related table '${relatedTableSchemaKey}' for relation '${relationName}'.`)
        }
      }
    }
    console.log('joinsToApply', joinsToApply)
  }
  console.log('[API] Final selectConfig for Drizzle:', Object.keys(finalSelectConfig))

  // Build main query
  let builder = db.select(finalSelectConfig).from(table)

  // 3. Apply all determined joins
  joinsToApply.forEach(join => {
    builder = builder.leftJoin(join.targetTable, join.onCondition)
  })
  // Apply WHERE conditions
  const whereConditions = []

  if (options.where) {
    for (const [key, value] of Object.entries(options.where)) {
      whereConditions.push(eq((table as any)[key], value))
    }
  }
  whereConditions.push(eq((table as any)['id'], id))

  if (whereConditions.length) {
    builder = builder.where(and(...whereConditions))
  }

  const data = await builder.get()

  return data
})
