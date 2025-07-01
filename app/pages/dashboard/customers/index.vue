<script lang="ts" setup>
import { sub } from 'date-fns'
import type { Range } from '~/types'
import { getCompareLabel } from '#shared/utils/compareDate'
import type { Analytics } from '#shared/types/analyticsBox'

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 30 }),
  end: new Date()
})

const { data: analytics } = await useFetch<Analytics[]>('/api/analytics/customers', { default: () => [] })
const compareLabel = computed(() => getCompareLabel(range.value.start, range.value.end))

watch(range, async newRange => {
  const { data: newAnalytics } = await useFetch<Analytics[]>('/api/analytics/customers', {
    query: {
      start: newRange.start.toISOString(),
      end: newRange.end.toISOString()
    }
  })
  analytics.value = newAnalytics.value || []
}, { deep: true })
</script>

<template>
  <UDashboardPanel id="customers" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <DashboardAnalyticsHeader v-model="range" />
    </template>
    <template #body>
      <DashboardAnalyticsBox :analytics :compare-label />
      <DashboardCustomersTable />
    </template>
  </UDashboardPanel>
</template>
