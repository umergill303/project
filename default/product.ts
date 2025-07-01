import { Season } from '#shared/types/enums'
import type { Product } from '~~/server/database/schema'

export const defaultProduct: Omit<Product, 'id'> = {
  sku: '',
  name: '',
  season: Object.values(Season)[0] ?? null,
  overview: '',
  description: '',
  thumbnail: '',

  video: '',

  fetched: false,
  featured: false,
  hVariants: false,
  published: false,

  ogImg: '',
  seoTags: '',
  seoTitle: '',
  seoDescription: '',

  specs: '{}',
  features: '',

  tags: '',
  brand: null,
  category: null,

  sold: 0,
  stock: 1,
  discount: 0,
  salePrice: 1,
  purchasePrice: 1,

  shippingCost: 0,
  freeShipping: false,
  brandWrtDuration: '',
  sellerWrtDuration: '',
  estimatedDelivery: '',
  minShippingProducts: 1,
  maxShippingProducts: 5,
  brandWarranty: false,
  sellerWarranty: false,

  view: 0,
  likes: 0,
  shares: 0,
  createdAt: null,
  rating: 0,
}
