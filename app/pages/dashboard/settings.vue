<script setup lang="ts">
const route = useRoute()
const links = [
  {
    label: 'General',
    icon: 'i-heroicons-building-storefront',
    to: '/dashboard/settings',
    description: 'Configure your store’s name, logo, and branding'

  },
  {
    label: 'Marketing',
    icon: 'i-heroicons-share',
    to: '/dashboard/settings/marketing',
    description: 'Connect your social media accounts'
  },
  {
    label: 'Business',
    icon: 'i-heroicons-cog',
    to: '/dashboard/settings/business',
    description: 'Set currencies, taxes, and shipping'
  },
  {
    label: 'Policies',
    icon: 'i-heroicons-document-text',
    to: '/dashboard/settings/policies',
    description: 'Manage terms, privacy, and return policies'
  },
  {
    label: 'Content & SEO',
    icon: 'i-heroicons-pencil-square',
    to: '/dashboard/settings/content',
    description: 'Edit site content and search optimization'
  },
  {
    label: 'Features',
    icon: 'i-heroicons-sparkles',
    to: '/dashboard/settings/features',
    description: 'Toggle and customize store functionalities'
  }
]

const items = computed(() => [
  links.map(link => ({
    ...link,
    active: route.path === link.to || (link.to !== '/dashboard/settings' && route.path.startsWith(link.to ?? ''))
  }))]
)
</script>

<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <UNavigationMenu :items highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
