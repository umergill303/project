<script setup lang="ts">
const props = defineProps<{
  product: Product
  attributeId: string
  attributeType?: string
  refresh: () => void
}>()
const emit = defineEmits(['refresh'])
const optionState = reactive({
  name: '', attribute: props.attributeId, color: '' })

const isSubmitting = ref(false)
const optionImagesRef = ref()

async function addOption(e: Event) {
  e.preventDefault()
  if (props.product.activeVariants === true) {
    const confirmed = window.confirm(
      'Are you sure? All your active variants will be moved to inactive when you add a new option.'
    )
    if (!confirmed) return
  }

  if (props.attributeType === 'Image') {
    if (!optionImagesRef.value?.validate()) return
    const images = optionImagesRef.value.images
    isSubmitting.value = true

    try {
      for (const image of images) {
        const formData = new FormData()
        formData.append('data', JSON.stringify({ ...optionState }))
        if (image.file) { formData.append('files', image.file) }

        await $fetch(`/api/products/${props.product.id}/attributes/${props.attributeId}/options`, {
          method: 'POST',
          body: formData,
        })
      }
      optionState.name = ''
      optionState.color = ''
      optionImagesRef.value.images.splice(0) // clear images
      emit('refresh')
    }
    catch (error) {
      console.error('Failed to create options:', error)
    }
    finally {
      isSubmitting.value = false
    }
    return
  }

  // For non-image types
  if (!optionState.name.trim()) return

  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('data', JSON.stringify(optionState))
    await $fetch(`/api/products/${props.product.id}/attributes/${props.attributeId}/options`, {
      method: 'POST',
      body: formData,
    })

    optionState.name = ''
    optionState.color = ''
    emit('refresh')
  }
  catch (error) {
    console.error('Failed to create option:', error)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UForm :state="optionState" @submit="addOption">
    <div v-if="attributeType === 'Image'">
      <OptionImages ref="optionImagesRef" class="w-full" />
      <div class="w-full flex justify-end">
        <UButton
          type="submit"
          :label="isSubmitting ? 'Adding...' : 'Add Option'"
          :icon="isSubmitting ? 'i-heroicons-arrow-path' : 'i-heroicons-plus'"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          variant="soft"
          size="sm"
          class="px-2.5 mt-2" />
      </div>
    </div>

    <div v-else-if="attributeType === 'Color'" class="flex gap-1.5 mt-2">
      <UInput
        v-model="optionState.name"
        type="text"
        required
        placeholder="Color Name (e.g., Red)"
        class="flex-1"
        size="sm"
        variant="subtle"
        :disabled="isSubmitting" />
      <UInput
        v-model="optionState.color"
        type="color"
        class="w-24"
        variant="subtle"
        :disabled="isSubmitting" />
      <UButton
        type="submit"
        :label="isSubmitting ? 'Adding...' : 'Add Option'"
        :icon="isSubmitting ? 'i-heroicons-arrow-path' : 'i-heroicons-plus'"
        :loading="isSubmitting"
        :disabled="isSubmitting || !optionState.name.trim()"
        variant="soft"
        size="sm"
        class="px-2.5" />
    </div>

    <div v-else class="flex gap-1.5 mt-2">
      <UInput
        v-model="optionState.name"
        type="text"
        required
        placeholder="Add new option"
        class="flex-1"
        variant="subtle"
        :disabled="isSubmitting" />
      <UButton
        type="submit"
        :label="isSubmitting ? 'Adding...' : 'Add Option'"
        :icon="isSubmitting ? 'i-heroicons-arrow-path' : 'i-heroicons-plus'"
        :loading="isSubmitting"
        :disabled="isSubmitting || !optionState.name.trim()"
        variant="soft"
        size="sm"
        class="px-2.5" />
    </div>
  </UForm>
</template>
