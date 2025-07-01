import type { AttributeType } from '#shared/types/enums'

export interface Attribute {
  id?: string
  name: string
  order: number
  attributeType: AttributeType
  options: Option[]
}

export interface Option {
  id?: string
  name: string
  hint: string
  color: string
  image: string
  order: number
}

export interface Variant {
  id?: string
  productId: string
  purchasePrice: number | null
  salePrice: number | null
  discount: number
  stock: number | null
  sku: string
  order: number
  active: boolean
  selectedOptions: Record<string, string> // attributeId -> optionId
  displayName?: string
  isUnsaved?: boolean
}
