<script lang="ts" setup>
const props = defineProps({
  modelValue: { type: String, default: () => '[]' }
})

const highlights = ref<string[]>([])
const emit = defineEmits(['update:modelValue'])

function updateHighlightsFromModelValue() {
  try {
    const parsed = JSON.parse(props.modelValue || '[]') as string[]
    highlights.value = parsed
  }
  catch (e) {
    console.warn('Invalid JSON in modelValue', e)
    highlights.value = []
  }
}

watch(() => props.modelValue, () => {
  updateHighlightsFromModelValue()
}, { immediate: true })

watch(highlights, newHighlights => {
  emit('update:modelValue', JSON.stringify(newHighlights))
}, { deep: true })

function addHighlight() {
  highlights.value.push('')
}

function removeHighlight(index: number) {
  highlights.value.splice(index, 1)
}
</script>

<template>
  <div class="space-y-2 mt-3">
    <div class="flex items-center justify-between">
      <p class="font-medium">
        Highlights
      </p>
      <UButton variant="soft" icon="i-heroicons-plus" label="Add Highlights" class="px-4.5 cursor-pointer" @click="addHighlight" />
    </div>

    <div v-for="(hl, index) in highlights" :key="index" class="flex gap-2 items-center">
      <UInput v-model="highlights[index]" variant="subtle" placeholder="Enter highlight" class="flex-1" />
      <UButton color="error" variant="soft" icon="i-heroicons-x-mark" @click="removeHighlight(index)" />
    </div>
  </div>
</template>
