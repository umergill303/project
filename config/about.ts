import { UInput, USelect, UTextarea } from '#components'

export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' }
]

export const currencyOptions = currencies.map(currency => ({
  label: `${currency.name} (${currency.symbol})`,
  value: { code: currency.code, symbol: currency.symbol, name: currency.name }
}))

export const StoreIdentity = [
  {
    title: 'Store Identity',
    description: 'Configure your store\'s basic information and branding',
    icon: 'i-heroicons-building-storefront',
    iconColor: 'text-info',
    identityOptions: [
      { key: 'storeName', label: 'Name', component: UInput, type: 'text' },
      { key: 'storeLogo', label: 'Logo', component: UInput, type: 'file' }
    ],
    otherKeys: [
      { key: 'contactEmail', label: 'Contact Email', component: UInput, type: 'email' },
      { key: 'supportEmail', label: 'Support Email', component: UInput, type: 'email' },
      { key: 'contactPhone', label: 'Phone Number', component: UInput, type: 'tel' },
      { key: 'address', label: 'Physical Address', component: UInput, type: 'text' },
      { key: 'googleMapsLink', label: 'Google Maps Link', component: UInput, type: 'url' }
    ]
  }
]

export const Marketing = [
  {
    title: 'Connect Your Social Presence',
    description: 'Expand your reach by linking all your social media profiles - boost engagement and grow your audience',
    icon: 'i-heroicons-share',
    iconColor: 'text-primary',
    keys: [
      { key: 'facebook', label: 'Facebook', component: UInput, type: 'url', icon: 'i-simple-icons-facebook', color: '#1877F2', domains: ['facebook.com', 'fb.com', 'fb.me'] },
      { key: 'instagram', label: 'Instagram', component: UInput, type: 'url', icon: 'i-simple-icons-instagram', color: '#E4405F', domains: ['instagram.com', 'instagr.am'] },
      { key: 'twitter', label: 'Twitter (X)', component: UInput, type: 'url', icon: 'i-simple-icons-x', color: '#000000', domains: ['twitter.com', 'x.com'] },
      { key: 'youtube', label: 'YouTube', component: UInput, type: 'url', icon: 'i-simple-icons-youtube', color: '#FF0000', domains: ['youtube.com', 'youtu.be'] },
      { key: 'linkedin', label: 'LinkedIn', component: UInput, type: 'url', icon: 'i-simple-icons-linkedin', color: '#0A66C2', domains: ['linkedin.com', 'lnkd.in'] },
      { key: 'pinterest', label: 'Pinterest', component: UInput, type: 'url', icon: 'i-simple-icons-pinterest', color: '#E60023', domains: ['pinterest.com', 'pin.it'] },
      { key: 'tiktok', label: 'TikTok', component: UInput, type: 'url', icon: 'i-simple-icons-tiktok', color: '#000000', domains: ['tiktok.com', 'vm.tiktok.com'] },
      { key: 'reddit', label: 'Reddit', component: UInput, type: 'url', icon: 'i-simple-icons-reddit', color: '#FF4500', domains: ['reddit.com', 'redd.it'] },
      { key: 'whatsapp', label: 'WhatsApp', component: UInput, type: 'url', icon: 'i-simple-icons-whatsapp', color: '#25D366', domains: ['whatsapp.com', 'wa.me'] },
      { key: 'telegram', label: 'Telegram', component: UInput, type: 'url', icon: 'i-simple-icons-telegram', color: '#26A5E4', domains: ['telegram.org', 't.me'] },
      { key: 'discord', label: 'Discord', component: UInput, type: 'url', icon: 'i-simple-icons-discord', color: '#5865F2', domains: ['discord.com', 'discord.gg'] }
    ]
  }
]

export const Business = [
  {
    title: 'Business Configuration',
    description: 'Set up currency, taxes and shipping options',
    icon: 'i-heroicons-cog',
    iconColor: 'text-warning',
    keys: [
      { key: 'currency', label: 'Currency', component: USelect, options: currencyOptions },
      { key: 'taxRate', label: 'Tax Rate (%)', component: UInput, type: 'number', step: '0.01' },
      { key: 'shippingCost', label: 'Default Shipping Cost', component: UInput, type: 'number', step: '0.01' },
      { key: 'freeShippingThreshold', label: 'Free Shipping Threshold', component: UInput, type: 'number', step: '0.01' }
    ]
  }
]

export const policies = [
  {
    name: 'returnPolicy',
    title: 'Return Policy',
    icon: 'i-fluent-group-return-24-regular',
    desc: 'Learn about our process for returning items smoothly.'
  },
  {
    name: 'shippingPolicy',
    icon: 'i-hugeicons-van',
    title: 'Shipping Policy',
    desc: 'Information about delivery times and shipping methods.'
  },
  {
    name: 'footerText',
    title: 'Footer Text',
    icon: 'i-mingcute-text-2-line',
    desc: 'General information displayed in website footer.'
  },
  {
    name: 'termsOfService',
    title: 'Terms of Service',
    icon: 'i-fluent-document-24-regular',
    desc: 'Legal terms governing use of our website.'
  }
]

export const Content = [
  {
    title: 'Content',
    description: 'Manage your store\'s content and SEO',
    icon: 'i-heroicons-pencil-square',
    iconColor: 'text-info',
    keys: [
      { key: 'aboutWebsite', label: 'About Website', component: UTextarea },
      { key: 'homepageHeroText', label: 'Homepage Hero Text', component: UTextarea },
      { key: 'footerText', label: 'Footer Text', component: UTextarea },
      { key: 'seoDescription', label: 'SEO Description', component: UTextarea },
      { key: 'seoKeywords', label: 'SEO Keywords', component: UTextarea }
    ]
  }
]

export const Features = [
  {
    title: 'Features',
    description: 'Enable or disable store features',
    icon: 'i-heroicons-sparkles',
    iconColor: 'text-error',
    keys: [
      { key: 'auth', label: 'User Authentication', component: 'USwitch', description: 'Enable secure account login and registration for users.' },
      { key: 'search', label: 'Product Search', component: 'USwitch', description: 'Allow customers to search for products quickly and easily.' },
      { key: 'productFiltering', label: 'Product Filtering', component: 'USwitch', description: 'Enable advanced filters like category, price, and rating on product listings.' },
      { key: 'recommendations', label: 'Product Recommendations', component: 'USwitch', description: 'Show personalized product suggestions to boost engagement.' },
      { key: 'cart', label: 'Shopping Cart', component: 'USwitch', description: 'Let customers add and manage products in their shopping cart.' },
      { key: 'wishlist', label: 'Wishlist', component: 'USwitch', description: 'Allow users to save favorite products for future purchases.' },
      { key: 'checkout', label: 'Checkout Process', component: 'USwitch', description: 'Activate the full checkout flow for processing orders.' },
      { key: 'orderHistory', label: 'Order History', component: 'USwitch', description: 'Show customers a history of their previous orders.' },
      { key: 'orderCancellation', label: 'Order Cancellation', component: 'USwitch', description: 'Let customers cancel orders before fulfillment.' },
      { key: 'orderTracking', label: 'Order Tracking', component: 'USwitch', description: 'Allow customers to track the status and shipment of their orders.' },
      { key: 'orderReturn', label: 'Order Returns', component: 'USwitch', description: 'Enable customers to request returns and refunds easily.' },
      { key: 'guestCheckout', label: 'Guest Checkout', component: 'USwitch', description: 'Allow customers to place orders without creating an account.' },
      { key: 'productVariants', label: 'Product Variants', component: 'USwitch', description: 'Support product options like size, color, and style.' },
      { key: 'enableReviews', label: 'Product Reviews', component: 'USwitch', description: 'Allow customers to leave reviews and ratings on products.' },
      { key: 'enableCoupons', label: 'Coupons/Discounts', component: 'USwitch', description: 'Enable discount codes and promotional offers at checkout.' },
      { key: 'maintenanceMode', label: 'Maintenance Mode', component: 'USwitch', description: 'Temporarily disable the storefront for maintenance or updates.' }
    ]
  }
]
