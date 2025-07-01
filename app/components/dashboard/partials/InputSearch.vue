<script lang="ts" setup>
defineEmits(['update:search'])
const input = useTemplateRef('input')
const props = defineProps({ search: String, placeholder: String })

defineShortcuts({
  '/': () => { input.value?.inputRef?.focus() }
})
</script>

<template>
  <UInput
    ref="input"
    :value="props.search"
    icon="i-lucide-search"
    variant="soft"
    class="shadow-sm"
    trailing-icon="i-solar-slash-square-line-duotone"
    :placeholder="`Search ${placeholder}`"
    :ui="{ base: 'w-[min(100%,15rem)]' }"
    @update:model-value="$emit('update:search', $event)" />
</template>
