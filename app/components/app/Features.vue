<script setup lang="ts">
const appConfig = useAppConfig()
const cards = ref([
  {
    title: 'Free Shipping',
    description: 'Orders over $200.',
    icon: 'i-lucide-truck',
  },
  {
    title: 'Money Returns',
    description: '30 Days money return.',
    icon: appConfig.ui.icons.dollar,
  },
  {
    title: '24/7 Support',
    description: 'Customer support.',
    icon: 'i-lucide-alarm-clock',
  },
])
</script>

<!-- <template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
    <UPageCard
      v-for="(card, index) in cards"
      :key="index"
      variant="subtle"
      :icon="card.icon"
      :title="card.title"
      :description="card.description"
      :ui="{ root: 'text-center font-medium', leadingIcon: 'size-8 -py-3' }" />
  </div>
</template> -->

<template>
  <!-- <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-3 p-4"> -->
  <div class="flex flex-wrap gap-3 justify-center">
    <UPageCard
      v-for="(card, index) in cards"
      :key="index"
      variant="subtle"
      :icon="card.icon"
      :title="card.title"
      :description="card.description"
      :ui="{ root: 'flex flex-col w-full md:w-fit sm:w-64 items-center text-center',
             leadingIcon: 'size-8 px-40',
             title: 'px-28',
             description: 'px-24',
             // root: 'text-center font-medium',
             // leadingIcon: 'size-8 mx-auto py-3',
      }" />
  </div>
</template>
