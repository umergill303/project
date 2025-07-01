<script lang="ts" setup>
import { formatCurrency } from '~/utils/formatCurrency'
import type { Analytics } from '#shared/types/analyticsBox'

interface Props {
  analytics: Analytics[]
  compareLabel: string
}
defineProps<Props>()
const { ui } = useAppConfig()
const isNegative = (change: string) => change.trim().startsWith('-')
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
    <UPageCard
      v-for="item in analytics"
      :key="item.label"
      variant="soft"
      :ui="{ root: 'shadow-sm', container: 'px-5 py-3 sm:px-5 sm:py-3', header: 'flex', description: 'font-medium text-xl text-primary -my-2.5', footer: 'w-full flex items-center justify-between font-medium text-sm' }">
      <template #header>
        <div class="flex gap-2">
          <p class="font-medium text-nowrap text-lg">
            {{ item.label }}
          </p>
          <UButton
            size="sm"
            variant="link"
            :label="`${item.change}`"
            :color="isNegative(item.change)? 'error': 'primary'"
            :trailing-icon="isNegative(item.change) ? ui.icons.arrowDown : ui.icons.arrowUp" />
        </div>
      </template>
      <template #description>
        <p class="text-xl font-medium text-primary">
          {{ item.label === 'Total Sale' ? formatCurrency(item.value) : item.value }}
        </p>
      </template>
      <template #footer>
        <p>{{ compareLabel }}</p>
        <p>{{ item.compareValue }}</p>
      </template>
    </UPageCard>
  </div>
</template>
