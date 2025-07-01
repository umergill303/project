<script lang="ts" setup>
defineProps<{ storeLogo: string, storeName: string }>()
</script>

<template>
  <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-90 transition">
    <NuxtImg
      v-if="storeLogo"
      :src="storeLogo"
      provider="cloudflare"
      class="w-full"
      alt="Store Logo" />
    <p class="font-semibold text-xl text-toned truncate max-w-36 md:max-w-full">
      {{ storeName || '' }}
    </p>
  </NuxtLink>
</template>
