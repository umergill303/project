<script lang="ts" setup>
interface EmptyCard {
  to?: string
  title?: string
  label?: string
  hasClick?: boolean
}

defineEmits(['click'])
const { ui } = useAppConfig()
const props = defineProps<EmptyCard>()
const showButton = computed(() => !!props.to || props.hasClick)
</script>

<template>
  <div class="flex flex-col items-center justify-center p-6 text-center gap-4">
    <div class="relative">
      <UIcon :name="ui.icons.empty" class="size-14 text-highlighted/80 animate-pulse transition-all duration-300" />
    </div>
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-highlighted">
        No {{ title }} yet
      </h3>
      <p class="font-['Lato'] text-highlighted/80 max-w-xs">
        Looks like you haven’t added any {{ title }} yet. Let’s change that!
      </p>
    </div>
    <UButton
      v-if="showButton"
      :label
      :to
      color="primary"
      variant="outline"
      :icon="ui.icons.plus"
      class="mt-2 group cursor-pointer px-5"
      :ui="{ leadingIcon: 'h-4 w-4 group-hover:rotate-90 transition-transform duration-300' }"
      @click="$emit('click')" />
  </div>
</template>
