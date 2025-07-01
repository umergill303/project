<script lang="ts" setup>
import { sub } from 'date-fns'
import type { Range } from '~/types'
import { getCompareLabel } from '#shared/utils/compareDate'
import type { Analytics } from '#shared/types/analyticsBox'

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})

const { data: analytics, refresh: refreshAnalytics } = await useFetch<Analytics[]>('/api/analytics/products', {
  default: () => [], key: 'products-analytics',
})

const compareLabel = computed(() => getCompareLabel(range.value.start, range.value.end))

watch(range, async newRange => {
  try {
    const { data: newAnalytics } = await useFetch<Analytics[]>('/api/analytics/products', {
      query: {
        start: newRange.start.toISOString(),
        end: newRange.end.toISOString(),
        forceRefresh: 'true'
      }
    })
    analytics.value = newAnalytics.value || []
  }
  catch (error) {
    console.error('Failed to fetch analytics for new range:', error)
  }
}, { deep: true })
</script>

<template>
  <UDashboardPanel id="brands" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <DashboardAnalyticsHeader v-model="range" />
    </template>
    <template #body>
      <DashboardAnalyticsBox :analytics :compare-label />
      <DashboardProductsTable @update-analytics="refreshAnalytics" />
    </template>
  </UDashboardPanel>
</template>
