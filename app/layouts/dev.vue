<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[][] = [
  [
    {
      label: 'Home',
      icon: 'i-lucide-house',
      to: '/'
    },
    {
      label: 'Dev Zone',
      icon: 'i-lucide-workflow',
      to: '/dev'
    },
    {
      label: 'UI (User Interface)',
      icon: 'i-lucide-palette',
      to: '/dev/ui'
    },
    {
      label: 'UX (User Experience)',
      icon: 'i-lucide-sparkles',
      to: '/dev/ux'
    },
    {
      label: 'Features',
      icon: 'i-lucide-puzzle',
      to: '/dev/features'
    },
    {
      label: 'Bugs',
      icon: 'i-lucide-bug',
      to: '/dev/bugs'
    },
    {
      label: 'Improvements',
      icon: 'i-lucide-goal',
      to: '/dev/improvements'
    },
    {
      label: 'Left',
      icon: 'i-lucide-loader',
      to: '/dev/left'
    },
    {
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/dev/dashboard'
    },
  ]
]
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable :ui="{ footer: 'border-t border-default' }">
      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="items"
          orientation="vertical"
          class="mt-10" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
