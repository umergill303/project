// correct tables path
import type { tables as SchemaValue } from '~~/server/utils/drizzle'

// Schema is now the TYPE of the imported tables value.
type Schema = typeof SchemaValue

type InternalKeys = '$inferSelect' | '$inferInsert' | '_' | 'getSQL' // Added getSQL for Drizzle columns

// Utility types for schema introspection
type AllTableNames = keyof Schema // Now keyof Schema (which is typeof SchemaValue) should work
type ColumnsForTable<T extends AllTableNames> = Exclude<keyof Schema[T], InternalKeys>

// Pattern for selecting multiple columns from a related table, e.g., "name&logo"
// This is a basic pattern; full multi-select intellisense is very complex.
type MultiColumnPattern<T extends AllTableNames> =
  `${ColumnsForTable<T> & string}(&${ColumnsForTable<T> & string})*`

// Defines a single item in the new 'select' array
type SelectPath<TMainTable extends AllTableNames> =
  // Option 1: A column from the main table
  | ColumnsForTable<TMainTable> & string
  // Option 2: A column or columns from a related table
  | {
    [TRelatedTable in Exclude<AllTableNames, TMainTable>]: // Iterate over potential related tables
    // Select all columns from related table: e.g., "store__*"
      | `${TRelatedTable & string}__*`
        // Select a single specific column from related table: e.g., "brand__name"
      | `${TRelatedTable & string}__${ColumnsForTable<TRelatedTable> & string}`
        // Select multiple specific columns from related table: e.g., "category__name&logo"
        // The type system will primarily suggest single columns after "__".
        // The "&" pattern is more for runtime parsing.
      | `${TRelatedTable & string}__${MultiColumnPattern<TRelatedTable>}`
  }[Exclude<AllTableNames, TMainTable>]

type WhereClause<T extends AllTableNames> = Partial<{
  // Assuming Schema[T][K] gives the column type, and _type is a property of that Drizzle column type
  [K in ColumnsForTable<T>]: Schema[T][K] extends { _type: infer U } ? U : any;
}>

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type MaxLimit = Exclude<Enumerate<101>, 0>

const DEFAULT_META_FIELDS = ['limit', 'offset', 'total'] as const
type MetaOption = typeof DEFAULT_META_FIELDS[number]

interface OrderBy<T extends AllTableNames> {
  field: ColumnsForTable<T> // For now, order by main table fields. Could be extended.
  order: 'asc' | 'desc'
}

interface QParamsOptions<T extends AllTableNames> {
  select?: SelectPath<T>[] // Updated select type
  where?: WhereClause<T>
  limit?: MaxLimit
  offset?: number
  meta?: true | MetaOption[]
  countOnly?: false
  search?: string
  searchFields?: (ColumnsForTable<T> & string)[]
  orderBy?: OrderBy<T>[]
  // 'relations' option is now removed
}

interface QParamsCountOnlyOption<T extends AllTableNames> {
  countOnly: true
  where?: WhereClause<T>
  meta?: true | MetaOption[]
  search?: string
  searchFields?: (ColumnsForTable<T> & string)[]
}

type QParamsInput<T extends AllTableNames> =
  | QParamsOptions<T>
  | QParamsCountOnlyOption<T>

// Output type reflects that 'relations' is no longer a top-level param
interface QParamsOutput<T extends AllTableNames> {
  select?: string[] // Server will parse these strings
  where?: WhereClause<T>
  limit?: MaxLimit
  offset?: number
  meta?: MetaOption[]
  countOnly?: boolean
  search?: string
  searchFields?: string[]
  orderBy?: OrderBy<T>[]
}

export function demoParams<T extends AllTableNames>(
  tableName: T,
  options: QParamsInput<T>
): QParamsOutput<T> {
  let meta: MetaOption[] | undefined = undefined
  if ('meta' in options && options.meta === true) {
    meta = [...DEFAULT_META_FIELDS]
  }
  else if ('meta' in options && Array.isArray(options.meta)) {
    meta = options.meta.filter(m => DEFAULT_META_FIELDS.includes(m))
  }

  // The select options are now strings that need server-side parsing.
  // Ensure 'select' is passed as string[] if present.
  const select = 'select' in options && options.select
    ? Array.from(new Set(options.select as string[])) // Cast to string[]
    : undefined

  const searchFields = 'searchFields' in options && options.searchFields
    ? Array.from(new Set(options.searchFields as string[]))
    : undefined

  const baseOutput: Omit<QParamsOutput<T>, 'select' | 'searchFields' | 'meta' | 'where' | 'limit' | 'offset' | 'orderBy' | 'countOnly'> = {}

  const output: QParamsOutput<T> = { ...baseOutput }

  if (options.countOnly) {
    output.countOnly = true
    if (options.where) output.where = options.where
    if (options.search) output.search = options.search
    if (options.searchFields) output.searchFields = searchFields
    if (options.meta) output.meta = meta // Meta can be requested with countOnly
  }
  else {
    if (select) output.select = select
    if (options.where) output.where = options.where
    if (options.limit != null && options.limit <= 100) output.limit = options.limit
    if (options.offset != null && options.offset >= 0) output.offset = options.offset
    if (meta) output.meta = meta
    if (options.search) output.search = options.search
    if (searchFields) output.searchFields = searchFields
    if (options.orderBy) output.orderBy = options.orderBy as any // Type assertion might be needed due to complexity
  }

  return output
}
