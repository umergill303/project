export interface OfferType {
  id?: string
  endDate?: string
  discount?: number
  startDate?: string
  name?: string | null
  products?: Product[]
  active?: boolean | null
  description?: string | null
}
