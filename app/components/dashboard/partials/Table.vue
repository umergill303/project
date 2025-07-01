<script lang="ts" setup generic="T">
import type { TableColumn } from '@nuxt/ui'

interface Table {
  data: T[]
  title: string
  columns: TableColumn<T>[]
  loading: boolean
  label?: string
  to?: string
}

defineProps<Table>()
const table = ref()
defineExpose({ table })
</script>

<template>
  <UPageCard variant="soft" :ui="{ root: ' overflow-auto scroll shadow-sm', container: 'p-0 sm:p-0 z-50', body: 'w-full' }">
    <template #body>
      <UTable
        ref="table"
        :data
        :columns
        :loading
        loading-color="primary"
        :ui="{
          root: 'z-10',
          tr: 'border-none',
          base: 'w-full',
          td: 'text-sm text-default py-2 font-medium',
          th: 'text-highlighted/70 pt-7 text-nowrap',
          thead: 'relative [&>tr]:after:absolute [&>tr]:after:inset-x-0 [&>tr]:after:bottom-0 [&>tr]:after:h-px [&>tr]:after:bg-transparent',
        }">
        <template #empty>
          <DashboardPartialsEmptyCard :title :label :to />
        </template>
      </UTable>
    </template>
  </UPageCard>
</template>

<style scoped>
.scroll::-webkit-scrollbar {
  height: 0px;
}
</style>
