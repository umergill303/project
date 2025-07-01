import { defineNuxtModule } from 'nuxt/kit'
import { defu } from 'defu'
import type { ModuleOptions } from './types'
import { features } from './features'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'ecommerce',
    configKey: 'ecommerce',
  },
  defaults: {
    site: { name: 'ecommerce' },
    singleVendor: true,
    tablePrefix: '_ecommerce_',
    country: 'Pakistan',
    countryCode: 'PK',
    currency: 'PKR',
    features
  },
  async setup(options, nuxt) {
    console.log('🤖🤖🤖🤖🤖 ecommerce module loaded...')

    const nuxtOptions = nuxt.options
    const moduleOptions: ModuleOptions = defu(
      nuxtOptions.runtimeConfig.public.ecommerce || {}, {
        ...options
      })
    nuxtOptions.runtimeConfig.public.ecommerce = moduleOptions
  }
})
