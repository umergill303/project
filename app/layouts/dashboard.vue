<script lang="ts" setup>
const open = ref(false)
const route = useRoute()
const { ui } = useAppConfig()
const colorMode = useColorMode()
colorMode.preference = 'dark'

const rawLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: 'Slider', to: '/dashboard/slider', icon: 'i-lucide-gallery-horizontal' },
  { label: 'Tags', to: '/dashboard/tags', icon: 'i-lucide-tag' },
  { label: 'Brands', to: '/dashboard/brands', icon: 'i-tabler-brand-monday' },
  { label: 'Categories', to: '/dashboard/categories', icon: ui.icons.cate },
  { label: 'Customers', to: '/dashboard/customers', icon: 'i-lucide-users' },
  {
    label: 'Orders',
    to: '/dashboard/orders',
    icon: 'i-lucide-shopping-bag',
    defaultOpen: true,
    children: [
      { label: 'Manage Orders', to: '/dashboard/orders', icon: 'i-lucide-clipboard-list' },
      { label: 'Return Orders', to: '/dashboard/orders/return', icon: 'i-lucide-undo-dot' }
    ]
  },
  // { label: 'Voucher', to: '/dashboard/voucher', icon: ui.icons.voucher },
  {
    label: 'Products',
    to: '/dashboard/products',
    icon: ui.icons.product,
    defaultOpen: true,
    children: [
      { label: 'Manage Products', to: '/dashboard/products', icon: 'i-tabler-brand-producthunt' },
      { label: 'Add Product', to: '/dashboard/products/post', icon: ui.icons.add },
    ]
  },
]
const links = computed(() => [
  rawLinks.map(link => ({
    ...link,
    onSelect: () => open.value = false,
    active: route.path === link.to || (link.to !== '/dashboard' && route.path.startsWith(link.to ?? ''))
  })),
  [
    { label: 'Inbox', to: '/dashboard/inbox', icon: 'i-lucide-bell' },
  ]

])

const groups = computed(() => [
  { id: 'links', label: 'Go to', items: links.value.flat() }
])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSearch :groups />
    <UDashboardSidebar
      v-model:open="open"
      collapsible
      class="bg-elevated/25 relative"
      :ui="{ header: 'lg:border-b lg:border-default', footer: 'lg:border-t lg:border-default' }">
      <template #header="{ collapsed }">
        <DashboardStore :collapsed="collapsed" />
      </template>
      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed variant="soft" :class="{ '': collapsed }" />
        <UDashboardSidebarCollapse v-if="collapsed" />
        <UNavigationMenu highlight :collapsed :items="links[0]" orientation="vertical" :class="{ '': collapsed }" />
        <UNavigationMenu :collapsed :items="links[1]" orientation="vertical" :class="collapsed ? 'mt-auto mx-auto' : 'mt-auto'" />
      </template>
      <template #footer="{ collapsed }">
        <DashboardAccountUserMenu :collapsed />
      </template>
    </UDashboardSidebar>
    <slot />
  </UDashboardGroup>
</template>
