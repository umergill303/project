<script setup>
const { loggedIn, fetch } = useUserSession()
const { features } = useRuntimeConfig().public.ecommerce
const { ui } = useAppConfig()
await fetch()

const columns = ref([])
const { data } = await useFetch('/api/about')
console.log('aboutDara', data.value);

watchEffect(() => {
  // Define social media links
  const socialAccounts = computed(() => [
    {
      label: 'Facebook',
      icon: ui.icons.facebook || 'bi:facebook',
      to: data.value?.facebook || 'https://facebook.com',
      hasLink: !!data.value?.facebook,
    },
    {
      label: 'Instagram',
      icon: ui.icons.instagram || 'bi:instagram',
      to: data.value?.instagram || 'https://instagram.com',
      hasLink: !!data.value?.instagram,
    },
    {
      label: 'Twitter',
      icon: ui.icons.twitter || 'bi:twitter',
      to: data.value?.twitter || 'https://twitter.com',
      hasLink: !!data.value?.twitter,
    },
    {
      label: 'LinkedIn',
      icon: ui.icons.linkedin || 'bi:linkedin',
      to: data.value?.linkedin || 'https://linkedin.com',
      hasLink: !!data.value?.linkedin,
    },
    {
      label: 'YouTube',
      icon: ui.icons.youtube || 'bi:youtube',
      to: data.value?.youtube || 'https://youtube.com',
      hasLink: !!data.value?.youtube,
    },
    {
      label: 'Pinterest',
      icon: ui.icons.pinterest || 'bi:pinterest',
      to: data.value?.pinterest || 'https://pinterest.com',
      hasLink: !!data.value?.pinterest,
    },
    {
      label: 'TikTok',
      icon: ui.icons.tiktok || 'bi:tiktok',
      to: data.value?.tiktok || 'https://tiktok.com',
      hasLink: !!data.value?.tiktok,
    },
    {
      label: 'WhatsApp',
      icon: ui.icons.whatsapp || 'bi:whatsapp',
      to: data.value?.whatsapp || 'https://wa.me',
      hasLink: !!data.value?.whatsapp,
    },
    {
      label: 'Reddit',
      icon: ui.icons.reddit || 'bi:reddit',
      to: data.value?.reddit || 'https://reddit.com',
      hasLink: !!data.value?.reddit,

    },
    { label: 'Telegram',
      icon: ui.icons.telegram || 'bi:telegram',
      to: data.value?.telegram || 'https://t.me',
      hasLink: !!data.value?.telegram,
    },
    {
      label: 'Discord',
      icon: ui.icons.discord || 'bi:discord',
      to: data.value?.discord || 'https://discord.com',
      hasLink: !!data.value?.discord,
    }

  ])

  // Check if any social account has a valid link
  const hasSocialLinks = socialAccounts.value.some(account => account.hasLink)

  // Build columns
  columns.value = [
    {
      label: 'Information',
      children: computed(() => {
        const baseItems = []
        if (loggedIn.value) {
          return [
            ...baseItems,
            ...(features.auth
              ? [
                  {
                    label: 'Contact us',
                    icon: 'i-lucide-contact',
                    to: '/contact',
                  },
                  { label: 'Orders', icon: 'i-lucide-shopping-bag', to: '/orders' },
                ]
              : []),
            ...(features.wishlist
              ? [
                  {
                    label: 'Wishlist',
                    icon: 'i-lucide-heart',
                    to: '/wish',
                  },
                ]
              : []),
            ...(features.cart
              ? [{ label: 'Cart', icon: 'i-lucide-shopping-cart', to: '/cart' }]
              : []),
          ]
        }
        else {
          return [
            ...baseItems,
            ...(features.auth
              ? [
                  { label: 'Login', icon: 'i-lucide-log-in', to: '/login' },
                  { label: 'Register', icon: 'i-lucide-user', to: '/register' },
                ]
              : []),
          ]
        }
      }),
    },
    {
      label: 'About Us',
      children: computed(() => {
        const baseItems = []
        return [
          ...baseItems,
          ...(features.auth
            ? [
                {
                  label: 'About',
                  icon: 'i-lucide-info',
                  to: '/about',
                },
                { label: 'Privacy and Policy', icon: ui.icons.policy, to: '/privacy-policy' },
                { label: 'Terms and Conditions', icon: 'i-lucide-receipt-text', to: '/terms-and-conditions' },
              ]
            : []),
          ...(features.wishlist
            ? [
                {
                  label: 'Return and Refund Policy',
                  icon: ui.icons.returns,
                  to: '/return-and-refund-policy',
                },
              ]
            : []),
        ]
      }),
    },
  ]

  // Add Social Accounts column only if there are valid links
  if (hasSocialLinks) {
    columns.value.push({
      label: 'Social Accounts',
      children: computed(() =>
        socialAccounts.value.filter(account => account.hasLink).map(({ label, icon, to }) => ({
          label,
          icon,
          to,
        }))
      ),
    })
  }
})
</script>

<template>
  <!-- <UFooter>
    <template #top>
    -->
  <UContainer class="py-7 border-t border-default">
    <UFooterColumns :columns="columns">
      <template #left>
        <div class="space-y-3">
          <div class="text-3xl font-bold">
            {{ data?.storeName || 'Store Name' }}
          </div>
          <NuxtImg v-if="data?.storeLogo" :src="data?.storeLogo" provider="cloudflare" class="max-w-40" />
          <p class="text-sm w-full md:w-2/3 text-neutral-500">
            {{ data?.footerText || 'Footer text goes here' }}
          </p>
        </div>
      </template>

      <template #center>
        <div>
          <ul class="space-y-1">
            <!-- Assuming you want 'Information' column links here -->
            <li v-for="item in columns[0].children" :key="item.label">
              <NuxtLink :to="item.to" class="text-sm hover:underline flex items-center gap-2 text-green-500">
                <Icon :name="item.icon" class="text-lg" />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </template>
    </UFooterColumns>
  </UContainer>
<!--
    </template>
  </UFooter> -->
</template>
