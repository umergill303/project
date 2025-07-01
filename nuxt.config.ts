// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui-pro',
    '@nuxt/eslint',
    '@nuxthub/core',
    '@nuxt/image',
    '@nuxt/content',
    '@nuxtjs/seo',
    'nuxt-tiptap-editor',
    'nuxt-auth-utils',
  ],
  devtools: { enabled: true, timeline: { enabled: true } },
  app: { head: { htmlAttrs: { lang: 'en' } } },
  css: ['~/assets/css/main.css'],
  site: {
    url: process.env.SITE_URL,
    defaultLocale: process.env.DEFAULT_LOCALE
  },
  content: { experimental: { nativeSqlite: true } },
  runtimeConfig: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    }
  },
  future: { compatibilityVersion: 4 },
  experimental: {
    cookieStore: true, typedPages: true, writeEarlyHints: true,
    defaults: { nuxtLink: { trailingSlash: 'remove' } }
  },
  compatibilityDate: '2025-05-15',
  nitro: { experimental: { openAPI: true } },
  hub: { blob: true, cache: true, database: true, kv: true },
  ecommerce: {
    features: {
      auth: true,
      search: true,
      productFiltering: true,
      recommendations: true,
      cart: true,
      featured: true,
      wishlist: true,
      checkout: true,
      orderHistory: true,
      orderCancellation: true,
      orderTracking: true,
      orderReturn: true,
      guestCheckout: true,
      productVariants: true,
    }
  },
  eslint: { config: { stylistic: true } },
  image: { cloudflare: { baseURL: '/' } },
  tiptap: { prefix: 'Tiptap' },
  uiPro: { content: true, license: '34702$74-2489k284-92la439' },
})
