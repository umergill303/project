<script setup lang="ts">
import TiptapEditor from './TiptapEditor.vue'

defineProps({
  modelValue: { type: String, default: '' },
  name: { type: String, required: true },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <UFormField :name="name" :label="label" :required="required">
    <TiptapEditor
      :model-value="modelValue"
      class="w-full"
      @update:model-value="$emit('update:modelValue', $event)" />
  </UFormField>
</template>
