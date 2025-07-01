const isString = (value: any): value is string => typeof value === 'string'
const isBoolean = (value: any): value is boolean => typeof value === 'boolean'
const isObject = (value: any): value is Record<string, any> => value !== null && typeof value === 'object' && !Array.isArray(value)
const isArray = (value: any): value is any[] => Array.isArray(value)

interface QueryParams {
  select?: string[]
  where?: Record<string, any>
  limit?: number
  offset?: number
  meta?: boolean
  search?: string
  searchFields?: string[]
  orderBy?: {
    field: string
    order: 'asc' | 'desc'
  }[]
  countOnly?: boolean
  relations?: Record<string, true | string[] | string> // Updated relations type
}

export function parseQueryParams(tableName: string, query: any): QueryParams {
  const {
    select,
    where,
    limit,
    offset,
    meta,
    search,
    searchFields,
    orderBy,
    countOnly,
    relations, // New parameter
  } = query

  const qParams: QueryParams = {}

  if (select) {
    qParams.select = isArray(select) ? select : [select]
  }

  // if (where && isObject(where)) {
  //   qParams.where = where
  // }

  if (where) {
    let parsedWhere = where
    if (typeof where === 'string') {
      try {
        parsedWhere = JSON.parse(where)
      }
      catch {
        console.warn('Failed to parse "where" JSON')
      }
    }

    if (isObject(parsedWhere)) {
      qParams.where = parsedWhere
    }
  }

  if (limit != null && !isNaN(Number(limit))) {
    qParams.limit = Number(limit)
  }

  if (offset != null && !isNaN(Number(offset))) {
    qParams.offset = Number(offset)
  }

  if (meta != null) {
    qParams.meta = meta === 'true' || isArray(meta) || meta === true
  }

  if (countOnly != null) {
    qParams.countOnly = countOnly === 'true' || countOnly === true
  }

  if (search) {
    qParams.search = String(search)
  }

  if (searchFields) {
    qParams.searchFields = isArray(searchFields) ? searchFields : [searchFields]
  }

  if (orderBy) {
    const orders = isArray(orderBy) ? orderBy : [orderBy]
    qParams.orderBy = orders.map(o => ({
      field: o.field,
      order: o.order === 'desc' ? 'desc' : 'asc',
    }))
  }

  // Parse relations
  if (relations) {
    let parsedRelations = relations
    if (typeof relations === 'string') {
      try {
        parsedRelations = JSON.parse(relations)
      }
      catch {
        console.warn('Failed to parse "relations" JSON')
      }
    }
    if (isObject(parsedRelations)) {
      qParams.relations = {}
      // console.log('parsedRelations', parsedRelations)
      for (const relationKey in parsedRelations) { // e.g., relationKey is 'brand'
        const value = parsedRelations[relationKey] // This could be 'true', a column name string, or an object like {'0':'name', '1':'slug'} from qs
        // console.log('relationKey', relationKey)
        // console.log('value', value)

        if (isString(value)) {
          if (value.toLowerCase() === '*') {
            qParams.relations[relationKey] = '*'
          }
          else {
          // If it's a string but not 'true', treat it as a single column name for direct value retrieval
            qParams.relations[relationKey] = value.trim()
          }
        }
        else if (isBoolean(value) && value === true) { // Handles boolean true if it somehow bypasses query stringification
          qParams.relations[relationKey] = true
        }
        else if (Array.isArray(value)) { // If client sent a pre-parsed array (for selecting specific columns into a nested object)
          qParams.relations[relationKey] = value.map(s => String(s).trim()).filter(Boolean)
        }
        else if (isObject(value)) {
        // Handle qs array format for selecting specific columns into a nested object: { '0': 'name', '1': 'slug', ... }
          const columnArray = Object.values(value).map(s => String(s).trim()).filter(Boolean)
          if (columnArray.length > 0) {
            qParams.relations[relationKey] = columnArray
          }
        }
      }
    }
  }

  return qParams
}
