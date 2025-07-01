import type { Features } from './features'

export interface ModuleOptions {
  site: SiteOptions
  singleVendor: boolean // @default true
  tablePrefix: string // @default '_ecommerce_'
  country: string // @default 'Pakistan'
  countryCode: string // @default 'PK'
  currency: string // @default 'PKR'
  features: Features
}

export interface SiteOptions {
  name?: string
}
