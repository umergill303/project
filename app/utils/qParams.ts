type InternalKeys = '$inferSelect' | '$inferInsert' | '_'

type TableColumnNames<T extends keyof typeof tables> = Exclude<
  keyof typeof tables[T],
  InternalKeys
> extends string
  ? Extract<Exclude<keyof typeof tables[T], InternalKeys>, string>
  : never

type TableColumnType<T extends keyof typeof tables, C extends TableColumnNames<T>> =
  (typeof tables)[T][C] extends { _type: infer U } ? U : any

type WhereClause<T extends keyof typeof tables> = Partial<{
  [K in TableColumnNames<T>]: TableColumnType<T, K>
}>

type RelationDetail = true | string | string[] // true for all columns (nested), string[] for specific columns (nested), string for single column value (direct)

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type MaxLimit = Exclude<Enumerate<101>, 0>

const DEFAULT_META_FIELDS = ['limit', 'offset', 'total'] as const
type MetaOption = typeof DEFAULT_META_FIELDS[number]

interface OrderBy<T extends keyof typeof tables> {
  field: TableColumnNames<T>
  order: 'asc' | 'desc'
}

interface QParamsOptions<T extends keyof typeof tables> {
  select?: TableColumnNames<T>[]
  where?: WhereClause<T>
  limit?: MaxLimit
  offset?: number
  meta?: true | MetaOption[]
  countOnly?: false
  search?: string
  searchFields?: TableColumnNames<T>[]
  orderBy?: OrderBy<T>[]
  relations?: Record<string, RelationDetail> // Key is relation name (e.g., 'brand')
}

interface QParamsCountOnlyOption<T extends keyof typeof tables> {
  countOnly: true
  where?: WhereClause<T>
  meta?: true | MetaOption[]
  search?: string
  searchFields?: TableColumnNames<T>[]
}

type QParamsInput<T extends keyof typeof tables> =
  | QParamsOptions<T>
  | QParamsCountOnlyOption<T>

interface QParamsOutput<T extends keyof typeof tables> {
  select?: TableColumnNames<T>[]
  where?: WhereClause<T>
  limit?: MaxLimit
  offset?: number
  meta?: MetaOption[]
  countOnly?: boolean
  search?: string
  searchFields?: TableColumnNames<T>[]
  orderBy?: OrderBy<T>[]
  relations?: Record<string, RelationDetail>
}

export function qParams<T extends keyof typeof tables>(
  tableName: T,
  options: QParamsInput<T>
): QParamsOutput<T> {
  let meta: MetaOption[] | undefined = undefined
  if (options.meta === true) {
    meta = [...DEFAULT_META_FIELDS]
  }
  else if (Array.isArray(options.meta)) {
    meta = options.meta.filter(m => DEFAULT_META_FIELDS.includes(m))
  }

  const select = 'select' in options && options.select
    ? Array.from(new Set(options.select))
    : undefined

  const searchFields = 'searchFields' in options && options.searchFields
    ? Array.from(new Set(options.searchFields))
    : undefined

  const relations = 'relations' in options && options.relations
    ? options.relations
    : undefined

  return {
    ...(!options.countOnly && select && { select }),
    ...(options.where && { where: options.where }),
    ...(!options.countOnly && options.limit != null && options.limit <= 100 && { limit: options.limit }),
    ...(!options.countOnly && options.offset != null && options.offset >= 0 && { offset: options.offset }),
    ...(!options.countOnly && meta && { meta }),
    ...(options.countOnly && { countOnly: true }),
    ...(options.search && { search: options.search }),
    ...(options.search && searchFields && { searchFields }),
    ...(!options.countOnly && options.orderBy && { orderBy: options.orderBy }),
    ...(!options.countOnly && relations && { relations }),
  }
}
