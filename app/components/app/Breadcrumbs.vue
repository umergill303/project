<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const route = useRoute()
const pathSegments = route.path.split('/').filter(Boolean)

const isUUID = (segment: string) => {
  return /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.test(segment)
}

const breadcrumbs: BreadcrumbItem[] = []

// Home icon
breadcrumbs.push({
  to: '/',
  icon: 'i-lucide-house',
})

pathSegments.forEach((segment, index) => {
  const path = '/' + pathSegments.slice(0, index + 1).join('/')

  const item: Record<string, any> = {
    label: isUUID(segment)
      ? 'Detail'
      : segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }

  if (index < pathSegments.length - 1) {
    item.to = path
  }

  breadcrumbs.push(item)
})
</script>

<template>
  <UBreadcrumb :items="breadcrumbs" />
</template>
