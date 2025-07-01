<script lang="ts" setup>
const props = defineProps({
  modelValue: { type: String, default: () => '{}' }
})

const emit = defineEmits(['update:modelValue'])
const specs = ref<{ id: string, key: string, value: string }[]>([])
const isInternalUpdate = ref('')

function updateSpecsFromModelValue() {
  try {
    const parsed = JSON.parse(props.modelValue || '{}') as Record<string, string>
    specs.value = Object.entries(parsed).map(([key, value]) => ({
      id: crypto.randomUUID(), key, value
    }))
  }
  catch (e) {
    console.warn('Invalid JSON in modelValue', e)
    specs.value = []
  }
}

watch(() => props.modelValue, newVal => {
  if (newVal !== isInternalUpdate.value) {
    updateSpecsFromModelValue()
  }
}, { immediate: true })

watch(specs, newSpecs => {
  const result: Record<string, string> = {}
  newSpecs.forEach(item => {
    if (item.key) {
      result[item.key] = item.value
    }
  })
  const newValue = JSON.stringify(result)
  isInternalUpdate.value = newValue
  emit('update:modelValue', newValue)
}, { deep: true })

function addSpec() {
  specs.value.push({
    id: crypto.randomUUID(),
    key: '',
    value: ''
  })
}

function removeSpec(index: number) {
  specs.value.splice(index, 1)
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <p class="font-medium">
        Specification
      </p>
      <UButton variant="soft" icon="i-heroicons-plus" label="Add Specification" class="cursor-pointer" @click="addSpec" />
    </div>

    <div v-for="(spec, index) in specs" :key="spec.id" class="flex gap-2 items-center">
      <UInput v-model="spec.key" variant="subtle" placeholder="Specification name" class="flex-1" />
      <UInput v-model="spec.value" variant="subtle" placeholder="Specification value" class="flex-1" />
      <UButton color="error" variant="soft" icon="i-heroicons-x-mark" @click="removeSpec(index)" />
    </div>
  </div>
</template>
