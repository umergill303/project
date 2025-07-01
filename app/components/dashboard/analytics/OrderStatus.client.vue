<script setup lang="ts">
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  MarkPointComponent
} from 'echarts/components'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  MarkPointComponent,
  CanvasRenderer
])

const colorMode = useColorMode()
const orderStatus = ref<Record<string, number>>({})
const chartOption = ref(null)

const getCssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const generateChartOptions = (isDark: boolean, statusData: Record<string, number>) => {
  const data = Object.entries(statusData).map(([name, value]) => ({ name, value }))
  const bg = getCssVar('--ui-bg')
  const border = getCssVar('--ui-border')

  return {
    // backgroundColor: 'transparent',
    color: ['#8908da', '#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'],
    tooltip: {
      trigger: 'item',
      formatter: params => {
        const itemColor = params.color
        return `
          <div style="color: ${itemColor};font-weight: bold; margin-bottom: 5px;">${params.name}</div>
          <div style="font-weight: bold; font-size: 13px;">Count: ${params.value}</div>
          <div style="font-weight: bold; font-size: 13px;">Percentage: ${params.percent}%</div>
        `
      },
      backgroundColor: bg,
      borderColor: border,
      textStyle: {
        color: isDark ? '#FFFFFF' : '#333333'
      }
    },
    series: [
      {
        type: 'pie',
        radius: [40, 100],
        center: ['50%', '45%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 2,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        },
        label: {
          show: true,
          fontSize: 12,
          fontFamily: 'Microsoft YaHei',
          color: isDark ? '#fff' : '#333',
          formatter: '{b}'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data
      }
    ]
  }
}

const updateChart = () => {
  chartOption.value = generateChartOptions(
    colorMode.value === 'dark',
    orderStatus.value
  )
}

onMounted(async () => {
  try {
    const data = await $fetch<Record<string, number>>('/api/analytics/orderStatus')
    orderStatus.value = data || {}
    updateChart()
  }
  catch (e) {
    console.error('Failed to fetch order status', e)
  }
})

watch(() => colorMode.value, () => {
  updateChart()
})
</script>

<template>
  <div class="w-full h-75 flex flex-col items-center overflow-hidden bg-elevated/50 rounded-lg shadow-sm">
    <div class="flex justify-start w-full px-5 pt-4 font-medium">
      <p>Order statistics</p>
    </div>
    <VChart v-if="chartOption" :option="chartOption" class="w-full h-full" />
  </div>
</template>
