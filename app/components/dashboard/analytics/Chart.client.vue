<script setup>
import { eachDayOfInterval, eachWeekOfInterval, subMonths, subYears, startOfToday, endOfToday, format, parseISO, isSameDay, isSameWeek } from 'date-fns'
import { VisXYContainer, VisLine, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'
import { formatCurrency } from '~/utils/formatCurrency'

const { ui } = useAppConfig()
const chartRef = ref(null)
const chartWidth = ref(0)
const props = defineProps({ period: String, range: Object })

onMounted(() => {
  const resizeObserver = new ResizeObserver(([entry]) => {
    chartWidth.value = entry.contentRect.width
  })
  if (chartRef.value?.$el instanceof Element) {
    resizeObserver.observe(chartRef.value.$el)
  }
})

const activeFilter = ref('month')

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

const { data: revenueData } = await useFetch('/api/analytics/revenue')
const isNegative = change => change && change.trim().startsWith('-')

const { data: chartData } = await useAsyncData(async () => {
  if (!revenueData.value?.[0]?.dailyData) return []

  const intervals = {
    today: eachDayOfInterval,
    month: eachDayOfInterval,
    year: eachWeekOfInterval
  }

  const dates = intervals[activeFilter.value](currentRange.value)
  const dailyRevenueData = revenueData.value[0].dailyData

  return dates.map(date => {
    let amount = 0

    if (activeFilter.value === 'today') {
      const matchingData = dailyRevenueData.find(d =>
        isSameDay(parseISO(d.date), date))
      amount = matchingData?.amount || 0
    }
    else if (activeFilter.value === 'month') {
      const matchingData = dailyRevenueData.find(d =>
        isSameDay(parseISO(d.date), date))
      amount = matchingData?.amount || 0
    }
    else if (activeFilter.value === 'year') {
      const matchingData = dailyRevenueData.filter(d =>
        isSameWeek(parseISO(d.date), date))
      amount = matchingData.reduce((sum, d) => sum + (d.amount || 0), 0)
    }

    return { date, amount }
  })
}, {
  watch: [() => props.period, () => currentRange.value, activeFilter, revenueData],
  default: () => []
})

// Handle filter change
const setFilter = filter => {
  activeFilter.value = filter
}

// Accessor
const x = (_, i) => i
const y = d => d.amount
const formatDate = date => {
  if (activeFilter.value === 'today') {
    return format(date, 'h a')
  }
  else if (activeFilter.value === 'month') {
    return format(date, 'MMM d')
  }
  return format(date, 'MMM yyyy')
}
const template = d =>
  `<div class="font-medium">
    ${formatDate(d.date)}<br><p class="text-primary">${formatCurrency(d.amount)}</p>
  </div>`
</script>

<template>
  <UCard ref="chartRef" variant="soft" :ui="{ root: 'divide-y-0 shadow-sm', header: 'pt-2.5 flex justify-between items-center', body: '!px-0 !pt-0 !pb-3' }" class="w-full">
    <template #header>
      <div>
        <div class="flex items-center">
          <p class="font-medium text-lg">
            Revenue
          </p>
          <UButton
            v-if="revenueData?.[0]?.change"
            size="sm"
            variant="link"
            :label="revenueData[0].change"
            :color="isNegative(revenueData[0].change) ? 'error' : 'primary'"
            :trailing-icon="isNegative(revenueData[0].change) ? ui.icons.arrowDown : ui.icons.arrowUp" />
        </div>
        <p class="text-xl text-primary font-medium">
          {{ revenueData?.[0] ? `${formatCurrency(revenueData[0].value)}` : 'No data available' }}
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
