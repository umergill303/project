<script lang="ts" setup>
import type { Tag, Brand, Category } from '~~/server/database/schema'

defineEmits(['delete', 'modal'])
defineProps<{ items: (Brand | Category | Tag)[], loading: boolean, title: string }>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
    <template v-if="!loading && items.length === 0">
      <DashboardPartialsEmptyCard :title label="Add Classification" class="col-span-full" has-click @click="$emit('modal')" />
    </template>
    <template v-else-if="loading">
      <div v-for="n in 18" :key="n">
        <USkeleton v-if="title === 'brands' || title === 'categories'" class="aspect-[4/3] rounded-md shadow-md bg-(--ui-border-accented)" />
        <USkeleton v-else class="w-full h-20 rounded-md shadow-md bg-(--ui-border-accented)" />
      </div>
    </template>
    <template v-else>
      <UCard
        v-for="item in items"
        :key="item.id"
        size="sm"
        variant="soft"
        :ui="{ root: 'group relative overflow-hidden rounded shadow-sm', body: 'p-0 sm:p-0' }">
        <template v-if="title === 'brands' || title === 'categories'">
          <NuxtImg
            provider="cloudflare"
            :src="('logo' in item && item.logo) || '/noimage1.jpg'"
            class="w-full h-full object-cover object-center aspect-4/3 bg-(--ui-border-accented)" />
          <div class="absolute top-2 right-2 space-x-1 *:cursor-pointer">
            <UButton color="info" variant="soft" size="xs" icon="tabler:edit" @click="$emit('modal', item)" />
            <UButton color="error" size="xs" variant="soft" icon="tabler:trash" @click="$emit('delete', item.id)" />
          </div>
          <div class="absolute bottom-2 left-2 rounded px-4">
            <UChip v-if="'featured' in item && item.featured" position="top-left">
              <UButton color="neutral" :label="item.name?? ''" size="sm" />
            </UChip>
            <UButton v-else color="neutral" :label="item.name?? ''" size="sm" />
          </div>
        </template>
        <template v-else>
          <div class="px-3 py-2 font-medium text-sm">
            <p>{{ item.name }}</p>
            <div class="grid grid-cols-2 mt-2 gap-2 w-full *:cursor-pointer">
              <UButton
                color="info"
                variant="soft"
                size="sm"
                block
                label="Edit"
                icon="i-lucide-square-pen"
                @click="$emit('modal', item)" />
              <UButton
                color="error"
                variant="soft"
                size="sm"
                block
                label="Delete"
                icon="i-lucide-trash-2"
                @click="$emit('delete', item.id)" />
            </div>
          </div>
        </template>
      </UCard>
    </template>
  </div>
</template>
