<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { eachDayOfInterval, eachWeekOfInterval, subMonths, subYears, startOfToday, endOfToday, format, parseISO, isSameDay, isSameWeek } from 'date-fns'
import { VisXYContainer, VisLine, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'

const chartRef = ref(null)
const chartWidth = ref(0)
const activeFilter = ref<'today' | 'month' | 'year'>('month')

const dateRanges = {
  today: {
    start: startOfToday(),
    end: endOfToday()
  },
  month: {
    start: subMonths(new Date(), 1),
    end: new Date()
  },
  year: {
    start: subYears(new Date(), 1),
    end: new Date()
  }
}

const currentRange = computed(() => dateRanges[activeFilter.value])

onMounted(() => {
  const resizeObserver = new ResizeObserver(([entry]) => {
    chartWidth.value = entry?.contentRect.width ?? 0
  })
  if (chartRef.value?.$el instanceof Element) {
    resizeObserver.observe(chartRef.value.$el)
  }
})

const setFilter = (filter: 'today' | 'month' | 'year') => {
  activeFilter.value = filter
}

const { data: visitorData } = await useFetch('/api/analytics/visitors')

const chartData = computed(() => {
  if (!visitorData.value?.chart) return []

  const intervals = {
    today: eachDayOfInterval,
    month: eachDayOfInterval,
    year: eachWeekOfInterval
  }

  const dates = intervals[activeFilter.value](currentRange.value)
  const rawData = visitorData.value.chart

  return dates.map(date => {
    let amount = 0

    if (activeFilter.value === 'today' || activeFilter.value === 'month') {
      const match = rawData.find(d => isSameDay(parseISO(d.date), date))
      amount = match?.amount || 0
    }
    else if (activeFilter.value === 'year') {
      const matches = rawData.filter(d => isSameWeek(parseISO(d.date), date))
      amount = matches.reduce((sum, d) => sum + (d.amount || 0), 0)
    }

    return { date, amount }
  })
})

const x = (_, i) => i
const y = (d: { amount: number }) => d.amount

const formatDate = (date: Date) => {
  if (activeFilter.value === 'today') {
    return format(date, 'h a')
  }
  else if (activeFilter.value === 'month') {
    return format(date, 'MMM d')
  }
  return format(date, 'MMM yyyy')
}

const template = (d: { date: Date, amount: number }) =>
  `<div class="font-medium">
    ${formatDate(d.date)}<br><p class="text-primary">${d.amount.toLocaleString()}</p>
  </div>`
</script>

<template>
  <UCard ref="chartRef" variant="soft" :ui="{ root: 'divide-y-0 shadow-sm', header: 'pt-2.5 flex justify-between items-center', body: '!px-0 !pt-0 !pb-3' }" class="w-full">
    <template #header>
      <div>
        <div class="flex items-center">
          <p class="font-medium text-lg">
            Visitors
          </p>
          <UButton
            v-if="visitorData?.change"
            size="sm"
            variant="link"
            :label="visitorData.change"
            :color="visitorData.change.startsWith('-') ? 'error' : 'primary'"
            :trailing-icon="visitorData.change.startsWith('-') ? 'arrow-down' : 'arrow-up'" />
        </div>
        <p class="text-xl text-primary font-medium">
          {{ visitorData?.value ? visitorData.value.toLocaleString() : 'No data available' }}
        </p>
      </div>
      <div class="flex items-center gap-1 *:px-4">
        <UButton
          size="sm"
          label="Today"
          :color="activeFilter === 'today'? 'primary':'neutral'"
          :variant="activeFilter === 'today' ? 'solid' : 'subtle'"
          @click="setFilter('today')" />
        <UButton
          size="sm"
          label="Month"
          :color="activeFilter === 'month'? 'primary':'neutral'"
          :variant="activeFilter === 'month' ? 'solid' : 'subtle'"
          @click="setFilter('month')" />
        <UButton
          size="sm"
          label="Year"
          :color="activeFilter === 'year'? 'primary':'neutral'"
          :variant="activeFilter === 'year' ? 'solid' : 'subtle'"
          @click="setFilter('year')" />
      </div>
    </template>

    <VisXYContainer
      :data="chartData"
      :padding="{ top: 20, bottom: 0 }"
      :width="chartWidth"
      class="h-52 w-full transition-all duration-300 ease-in-out">
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--ui-primary)" stop-opacity="0.6" />
            <stop offset="100%" stop-color="var(--ui-primary)" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <VisArea :x="x" :y="y" color="url(#gradient)" curve-type="basis" :opacity="1" />
      <VisLine :x="x" :y="y" color="var(--ui-primary)" curve-type="basis" :stroke-width="2.5" />
      <VisCrosshair :template="template" color="var(--ui-primary)" />
      <VisTooltip />
    </VisXYContainer>
  </UCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-circle-stroke-color: var(--ui-bg);
  --vis-crosshair-line-stroke-color: var(--ui-primary);

  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
