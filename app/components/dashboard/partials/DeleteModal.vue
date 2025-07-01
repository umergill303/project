<script lang="ts" setup>
const { ui } = useAppConfig()
const emit = defineEmits(['update:isOpen', 'delete'])
const props = defineProps({ title: String, isOpen: Boolean, loading: Boolean })

defineShortcuts({
  enter: () => { if (props.isOpen) emit('delete') },
  escape: () => emit('update:isOpen', false),
})
</script>

<template>
  <UModal
    :open="isOpen"
    :close="false"
    :ui="{ content: 'divide-y-0 -space-y-5', header: 'flex justify-center', body: 'flex  flex-col items-center justify-center', footer: 'grid grid-cols-2 *:justify-center gap-2 *:cursor-pointer' }">
    <template #header>
      <UButton color="error" variant="soft" size="xl" icon="i-lucide-trash-2" class="rounded-full size-12 flex justify-center" />
    </template>
    <template #body>
      <p class="text-lg font-medium">
        Confirm Delete
      </p>

      <p class="px-10 font-['Lato'] text-center text-highlighted/70">
        Are you sure you want to delete your {{ title }}. This<br> action cannot be undone.
      </p>
    </template>
    <template #footer>
      <UButton color="neutral" variant="outline" label="Cancel" icon="i-lucide-eraser" @click="$emit('update:isOpen', false)" />
      <UButton :loading color="error" icon="i-lucide-trash-2" :label="`Delete ${title}`" @click="$emit('delete')" />
    </template>
  </UModal>
</template>
