<script lang="ts" setup>
import { sub } from 'date-fns'
import { useFetch } from '#app'
import { getCompareLabel } from '#shared/utils/compareDate'
import type { Analytics } from '#shared/types/analyticsBox'

const range = shallowRef({
  start: sub(new Date(), { days: 30 }),
  end: new Date()
})
const period = ref('daily')

const { data: analytics } = await useFetch<Analytics[]>('/api/analytics', { default: () => [] })
const compareLabel = computed(() => getCompareLabel(range.value.start, range.value.end))
watch(range, async newRange => {
  const { data: newAnalytics } = await useFetch<Analytics[]>('/api/analytics', {
    query: {
      start: newRange.start.toISOString(),
      end: newRange.end.toISOString()
    }
  })
  analytics.value = newAnalytics.value || []
}, { deep: true })
</script>

<template>
  <UDashboardPanel id="home" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <DashboardAnalyticsHeader v-model="range" />
    </template>
    <template #body>
      <DashboardAnalyticsBox :analytics :compare-label />
      <DashboardAnalyticsChart :period="period" :range="range" />
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <DashboardAnalyticsVisitors :period="period" :range="range" class="col-span-1 md:col-span-2 lg:col-span-4" />
        <DashboardAnalyticsOrderStatus class="col-span-1 md:col-span-1 lg:col-span-2" />
      </div>
    </template>
  </UDashboardPanel>
</template>
