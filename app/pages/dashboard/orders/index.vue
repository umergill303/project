<script lang="ts" setup>
import { sub } from 'date-fns'
import type { Range } from '~/types'
import { getCompareLabel } from '#shared/utils/compareDate'
import type { Analytics } from '#shared/types/analyticsBox'

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})

const { data: analytics, refresh: refreshAnalytics } = await useFetch<Analytics[]>('/api/analytics/orders', { default: () => [] })
const compareLabel = computed(() => getCompareLabel(range.value.start, range.value.end))

watch(range, async newRange => {
  const { data: newAnalytics } = await useFetch<Analytics[]>('/api/analytics/orders', {
    query: {
      start: newRange.start.toISOString(),
      end: newRange.end.toISOString(),
      forceRefresh: 'true'
    }
  })
  analytics.value = newAnalytics.value || []
}, { deep: true })
</script>

<template>
  <UDashboardPanel id="orders" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <DashboardAnalyticsHeader v-model="range" />
    </template>
    <template #body>
      <DashboardAnalyticsBox :analytics :compare-label />
      <DashboardOrdersTable @update-analytics="refreshAnalytics" />
    </template>
  </UDashboardPanel>
</template>
