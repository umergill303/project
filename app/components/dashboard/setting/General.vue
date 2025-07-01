<script lang="ts" setup>
import { StoreIdentity } from '~~/config/about'
import { useAbout } from '~/composables/useAbout'

const saving = ref(false)
const { ui } = useAppConfig()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isEditing = ref<Record<string, boolean>>({})
const state = ref<Record<string, string | number | boolean | File>>({})
const originalState = ref<Record<string, string | number | boolean>>({})
const selectedIdentityOption = ref<string>('storeName')

const { aboutData, fetchAbout } = useAbout()
onMounted(async () => {
  await fetchAbout()
  state.value = { ...aboutData.value }
  originalState.value = { ...aboutData.value }

  if (aboutData.value.storeLogo && !aboutData.value.storeName) {
    selectedIdentityOption.value = 'storeLogo'
  }
})

watch(aboutData, newData => {
  state.value = { ...newData }
  originalState.value = { ...newData }
})

const toggleEdit = (key: string) => {
  const fieldConfig = [
    ...StoreIdentity.flatMap(s => s.identityOptions || []),
    ...StoreIdentity.flatMap(s => s.otherKeys || [])
  ].find(f => f.key === key)

  if (!fieldConfig) return

  if (fieldConfig.type === 'file') {
    if (!fileInputRef.value) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.style.display = 'none'
      input.addEventListener('change', e => handleFileChange(e, key))
      document.body.appendChild(input)
      fileInputRef.value = input
    }
    fileInputRef.value.click()
  }
  else {
    isEditing.value[key] = true
    nextTick(() => document.getElementById(`${key}-input`)?.focus())
  }
}

const cancelEdit = (key: string) => {
  state.value[key] = originalState.value[key] ?? ''
  isEditing.value[key] = false
}

// Helper function to check if a field is an identity option
const isIdentityOption = (key: string) => {
  return StoreIdentity.some(section =>
    section.identityOptions?.some(option => option.key === key)
  )
}

const clearOppositeField = async (currentKey: string) => {
  const oppositeKey = currentKey === 'storeName' ? 'storeLogo' : 'storeName'
  if (state.value[oppositeKey]) {
    try {
      const formData = new FormData()
      formData.append(oppositeKey, '')
      await $fetch('/api/about', { method: 'PATCH', body: formData })
      await fetchAbout()
    }
    catch (error) {
      console.error('Error clearing opposite field:', error)
      showToast('error')
    }
  }
}

const handleFileChange = async (e: Event, key: string) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  saving.value = true
  try {
    const formData = new FormData()
    formData.append(key, file)

    // Only clear opposite field if this is an identity option
    if (isIdentityOption(key)) {
      await clearOppositeField(key)
    }

    await $fetch('/api/about', { method: 'PATCH', body: formData })
    await fetchAbout()
    showToast('aboutUpdated')
    selectedIdentityOption.value = 'storeLogo'
  }
  catch { showToast('error') }
  finally {
    saving.value = false
    if (fileInputRef.value) {
      document.body.removeChild(fileInputRef.value)
      fileInputRef.value = null
    }
  }
}

const saveField = async (key: string) => {
  if (saving.value) return

  const fieldConfig = [
    ...StoreIdentity.flatMap(s => s.identityOptions || []),
    ...StoreIdentity.flatMap(s => s.otherKeys || [])
  ].find(f => f.key === key)

  if (!fieldConfig || fieldConfig.type === 'file') return

  isEditing.value[key] = false

  const oldValue = originalState.value[key]
  const newValue = state.value[key]

  if (oldValue === newValue) return

  saving.value = true
  try {
    const formData = new FormData()
    formData.append(key, newValue?.toString() || '')

    // Only clear opposite field if this is an identity option (storeName or storeLogo)
    if (isIdentityOption(key)) {
      await clearOppositeField(key)
      selectedIdentityOption.value = 'storeName'
    }

    await $fetch('/api/about', { method: 'PATCH', body: formData })
    await fetchAbout()
    showToast('aboutUpdated')
  }
  catch { showToast('error') }
  finally { saving.value = false }
}
</script>

<template>
  <UForm :state>
    <UPageCard
      v-for="section in StoreIdentity"
      :key="section.title"
      variant="soft"
      :title="section.title"
      :description="section.description"
      :icon="section.icon"
      :ui="{ root: 'shadow-sm', wrapper: 'flex flex-row gap-4', description: '-mt-0.5', leading: 'mt-1 py-1 bg-primary/5 border border-primary/25 rounded px-2', leadingIcon: `size-7 ${section.iconColor}` }">
      <div class="grid grid-cols-2 w-full md:w-1/2 gap-2 mb-4">
        <UButton
          v-for="option in section.identityOptions"
          :key="option.key"
          size="sm"
          block
          :label="option.label"
          :variant="selectedIdentityOption === option.key ? 'solid' : 'outline'"
          @click="selectedIdentityOption = option.key" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <UFormField
          v-for="field in section.identityOptions.filter(f => f.key === selectedIdentityOption)"
          :key="field.key"
          :label="field.key === 'storeName' ? 'Store Name' : 'Store Logo'">
          <template v-if="field.type === 'file'">
            <div class="flex items-center gap-4">
              <div v-if="state[field.key]" class="flex items-center gap-2">
                <NuxtImg
                  v-if="typeof state[field.key] === 'string'"
                  provider="cloudflare"
                  :src="(state as Record<string, any>)[field.key]"
                  class="size-12 object-contain rounded" />
                <span v-else class="text-sm text-muted">New image selected</span>
              </div>
              <span v-else class="text-sm text-muted">No image selected</span>
              <UButton variant="soft" label="Change Logo" size="sm" @click="toggleEdit(field.key)" />
            </div>
          </template>

          <template v-else>
            <component
              :is="field.component"
              v-if="isEditing[field.key]"
              :id="`${field.key}-input`"
              v-model="(state as Record<string, any>)[field.key]"
              :type="field.type"
              class="w-full"
              variant="soft"
              size="lg"
              @keydown.enter.prevent="saveField(field.key)"
              @keydown.esc.prevent="cancelEdit(field.key)"
              @blur="saveField(field.key)" />
            <div v-else class="flex items-center justify-between group">
              <p class="text-base truncate">
                {{ state[field.key] || 'Not set' }}
              </p>
              <UButton
                color="neutral"
                variant="link"
                :icon="ui.icons.edit2"
                @click="toggleEdit(field.key)" />
            </div>
          </template>
        </UFormField>

        <!-- Other Fields -->
        <UFormField
          v-for="field in section.otherKeys"
          :key="field.key"
          :label="field.label">
          <component
            :is="field.component"
            v-if="isEditing[field.key]"
            :id="`${field.key}-input`"
            v-model="(state as Record<string, any>)[field.key]"
            :type="field.type"
            class="w-full"
            variant="soft"
            size="lg"
            @keydown.enter.prevent="saveField(field.key)"
            @keydown.esc.prevent="cancelEdit(field.key)"
            @blur="saveField(field.key)" />
          <div v-else class="flex items-center justify-between group">
            <p class="text-base truncate">
              {{ state[field.key] || 'Not set' }}
            </p>
            <UButton
              color="neutral"
              variant="link"
              :icon="ui.icons.edit2"
              @click="toggleEdit(field.key)" />
          </div>
        </UFormField>
      </div>
    </UPageCard>
  </UForm>
</template>
