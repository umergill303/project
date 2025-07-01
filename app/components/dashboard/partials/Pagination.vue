<script lang="ts" setup>
defineProps<{ limit: number, total: number }>()
const page = defineModel<number>({ default: 1 })
</script>

<template>
  <UPagination
    v-model:page="page"
    show-edges
    color="neutral"
    variant="soft"
    :sibling-count="1"
    :total
    active-color="primary"
    active-variant="solid"
    :items-per-page="limit"
    class="mt-2"
    :ui="{ list: 'flex items-center justify-center gap-1 *:cursor-pointer *:shadow-sm' }" />
</template>
