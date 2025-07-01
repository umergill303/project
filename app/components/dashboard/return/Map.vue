<script lang="ts" setup>
const { ui } = useAppConfig()
defineEmits(['update:isOpen'])
const props = defineProps<{ isOpen: boolean, order: Order | null }>()

const mapUrl = computed(() => {
  if (!props.order) return null
  const { address, city, province, country } = props.order
  const location = `${address}, ${city}, ${province}, ${country}`.replace(/\s+/g, '+')
  return `https://maps.google.com/maps?q=${location}&output=embed`
})
</script>

<template>
  <UModal :open="isOpen" title="Customer Location" :ui="{ header: 'flex justify-between' }">
    <template #close>
      <UButton :icon="ui.icons.close" color="neutral" variant="soft" @click="$emit('update:isOpen', false)" />
    </template>
    <template #body>
      <div class="aspect-video w-full rounded-md overflow-hidden">
        <iframe
          v-if="mapUrl"
          :src="mapUrl"
          width="100%"
          height="100%"
          allowfullscreen
          loading="lazy"
          style="border:0"
          referrerpolicy="no-referrer-when-downgrade" />
        <p v-else class="text-center text-sm text-red-500">
          Location information not available.
        </p>
      </div>
    </template>
  </UModal>
</template>
