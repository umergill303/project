<script lang="ts" setup>
defineProps<{ number: number }>()
</script>

<template>
  <NuxtLink to="/contact">
    <UUser
      name="Need help?"
      :description="number || ''"
      :ui="{
        wrapper: '*:font-medium *:text-nowrap cursor-pointer',
        name: 'text-muted text-xs',
        description: 'text-toned text-sm truncate max-w-30',
      }">
      <template #avatar>
        <UIcon name="i-lucide-phone" class="size-5" />
      </template>
    </UUser>
  </NuxtLink>
</template>
