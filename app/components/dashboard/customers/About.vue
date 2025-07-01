<script lang="ts" setup>
import type { User } from '~~/server/database/schema'

const { ui } = useAppConfig()
defineProps<{ customer: User }>()
</script>

<template>
  <div class="flex flex-wrap gap-15 p-5 font-medium *:space-y-3">
    <div>
      <p>Contact Information</p>
      <UPageFeature v-if="customer.phone" title="Phone" icon="i-lucide-phone" :description="customer.phone?? ''" />
      <UPageFeature v-if="customer.email" title="Email" icon="i-lucide-inbox" :description="customer.email?? ''" />
    </div>
    <div>
      <p>Basic Information</p>
      <UPageFeature v-if="customer.city" title="Address" icon="i-lucide-map-pin" :description="`${customer.street},${customer.postalCode}\n${customer.country},${customer.city}`" class="whitespace-pre-line" />
      <UPageFeature v-if="customer.birthday" title="Birthday" icon="i-lucide-cake" :description="customer.birthday?? ''" />
      <UPageFeature v-if="customer.gender" title="Gender" :icon="ui.icons.gender" :description="customer.gender?? ''" />
    </div>
  </div>
</template>
