<script lang="ts" setup>
import type { CheckboxGroupItem, CheckboxGroupValue } from '@nuxt/ui'

const items = ref<CheckboxGroupItem[]>([
  {
    label: 'Authentication',
    description: 'This is the first option.',
    id: 'authentication',
    // disabled: true
  },
  {
    label: 'Light',
    description: 'This is the second option.',
    id: 'light'
  },
  {
    label: 'Dark',
    description: 'This is the third option.',
    id: 'dark'
  }
])
const value = ref<CheckboxGroupValue[]>([
  'light'
])
// import { Features } from '~~/config/about'
// import { useAbout } from '~/composables/useAbout'

// const saving = ref(false)
// const state = ref<Record<string, string | number | boolean>>({})
// const isEditing = ref<Record<string, boolean>>({})
// const originalState = ref<Record<string, string | number | boolean>>({})

// const normalizeSwitchFields = (obj: Record<string, boolean>) => {
//   Features.flatMap(group => group.keys)
//     .filter(key => key.component === 'USwitch')
//     .forEach(key => { obj[key.key] = Number(obj[key.key]) })
// }
// const { aboutData, fetchAbout } = useAbout()

// onMounted(async () => {
//   await fetchAbout()
//   state.value = { ...aboutData.value }
//   originalState.value = { ...aboutData.value }
//   normalizeSwitchFields(state.value)
// })

// watch(aboutData, newData => {
//   state.value = { ...newData }
//   originalState.value = { ...newData }
//   normalizeSwitchFields(state.value)
// })

// const _saveField = async (key: string) => {
//   if (saving.value) return
//   isEditing.value[key] = false

//   const oldValue = originalState.value[key]
//   const newValue = state.value[key]

//   if (oldValue === newValue) return

//   saving.value = true
//   try {
//     const formData = new FormData()
//     formData.append(key, newValue?.toString() || '')
//     await $fetch('/api/about', { method: 'PATCH', body: formData })
//     originalState.value[key] = state.value[key] ?? ''
//     showToast('aboutUpdated')
//   }
//   catch { showToast('error') }
//   finally { saving.value = false }
// }
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full min-h-[40vh] p-8">
    <div class="relative">
      <!-- Animated circles decoration -->
      <div class="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-primary opacity-70 animate-pulse" />
      <div class="absolute -bottom-4 -right-4 w-12 h-12 rounded-full bg-primary opacity-70 animate-pulse delay-300" />

      <!-- Main content -->
      <div class="relative z-10 text-center">
        <div class="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
          <span class="bg-gradient-to-r from-primary-300 to-primary-600/70 text-transparent bg-clip-text">
            Coming Soon
          </span>
          <span class="text-primary animate-blink">...</span>
        </div>
        <p class="text-lg text-muted max-w-md leading-relaxed font-medium mb-6">
          We're crafting something special for you! This feature is currently in development.
        </p>

        <!-- Progress indicator -->
        <div class="w-full bg-(--ui-border-accented) rounded-full h-2.5 max-w-xs mx-auto mb-8">
          <div class="bg-gradient-to-r from-primary to-primary-700 h-2.5 rounded-full animate-progress" />
        </div>
      </div>
    </div>
  </div>
  <DevOnly>
    <UForm>
      <UCheckboxGroup
        v-model="value"
        value-key="id"
        variant="table"
        :items="items"
        loop />
    </UForm>
  </DevOnly>

  <!-- <UForm :state>
    <UPageCard
      v-for="section in Features"
      :key="section.title"
      variant="soft"
      :title="section.title"
      :description="section.description"
      :icon="section.icon"
      :ui="{ root: 'shadow-sm', wrapper: 'flex flex-row gap-4', description: '-mt-0.5', leading: 'mt-1 py-1 bg-primary/5 border border-primary/25 rounded px-2', leadingIcon: `size-7 ${section.iconColor}` }">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <UFormField v-for="field in section.keys" :key="field.key" :label="field.label">
          <USwitch
            :model-value="state[field.key] === 1"
            :description="field.description"
            :ui="{ root: 'flex items-center justify-between', description: 'order-1', container: 'order-2' }"
            @update:model-value="val => {
              state[field.key] = val ? 1 : 0
              saveField(field.key)
            }" />
        </UFormField>
      </div>
    </UPageCard>
  </UForm> -->
</template>

<style scoped>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes progress {
    0% { width: 0%; }
    100% { width: 70%; }
  }
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }
  .animate-blink {
    animation: blink 2s infinite;
  }
  .animate-progress {
    animation: progress 1.5s ease-out forwards;
  }
</style>
