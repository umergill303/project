<script lang="ts" setup>
import { sub } from 'date-fns'
import type { Range } from '~/types'
import { getCompareLabel } from '#shared/utils/compareDate'

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})

const { ui } = useAppConfig()
const compareLabel = computed(() => getCompareLabel(range.value.start, range.value.end))
const { data: analytics } = await useFetch('/api/analytics/returnOrder')

const items = ref([
  { to: '/dashboard', icon: 'i-lucide-house' },
  { label: 'Orders' },
])
</script>

<template>
  <UDashboardPanel id="orders" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <DashboardAnalyticsHeader v-model="range" :items />
    </template>
    <template #body>
      <DashboardAnalyticsBox :analytics :compare-label />
      <DashboardReturnTable />
    </template>
  </UDashboardPanel>
</template>
