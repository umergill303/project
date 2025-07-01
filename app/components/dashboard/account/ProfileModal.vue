<script lang="ts" setup>
import { defaultProfile } from '~~/default/profile'
import type { User } from '~~/server/database/schema'

const { ui } = useAppConfig()
defineEmits(['update:isOpen'])
defineProps<{ isOpen: boolean }>()

const { profile, fetchProfile } = useProfile()
await fetchProfile()

const state = ref<Partial<User>>({ ...defaultProfile, ...profile.value })
const editingField = ref<string | null>(null)

const saving = ref(false)
const avatar = ref<File | null>(null)
const addressSection = ref<HTMLElement>()
const personalSection = ref<HTMLElement>()
let blurTimeout: ReturnType<typeof setTimeout>
const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(profile.value?.avatar || null)

interface FormField {
  name: string
  label: string
}

interface FormSection {
  title: string
  fields: FormField[]
  ref: Ref<HTMLElement | undefined>
}

const sections: FormSection[] = [
  {
    ref: personalSection,
    title: 'Personal Information',
    fields: [
      { name: 'name', label: 'Name' }, { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Phone' }, { name: 'bio', label: 'Bio' },
    ],
  },
  {
    title: 'Address',
    ref: addressSection,
    fields: [
      { name: 'country', label: 'Country' }, { name: 'city', label: 'City' },
    ]
  }
]

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatar.value = file
  avatarPreview.value = URL.createObjectURL(file)
  await updateProfile()
}

const startEditing = (fieldName: string) => {
  editingField.value = fieldName
  nextTick(() => {
    const input = document.getElementById(`${fieldName}-input`)
    if (input) {
      input.focus()
      if (input instanceof HTMLInputElement) {
        input.selectionStart = input.selectionEnd = input.value.length
      }
    }
  })
}

const stopEditing = async () => {
  if (editingField.value) {
    await saveField(editingField.value)
  }
}

const saveField = async (fieldName: string) => {
  if (saving.value) return
  const originalValue = profile.value?.[fieldName as keyof User]
  const newValue = state.value[fieldName as keyof User]
  if (originalValue !== newValue) {
    saving.value = true
    try {
      await updateProfile()
      editingField.value = null
    }
    finally { saving.value = false }
  }
  else { editingField.value = null }
}

const updateProfile = async () => {
  try {
    const formData = new FormData()
    formData.append('data', JSON.stringify(state.value))
    if (avatar.value) formData.append('file', avatar.value)
    const updated = await $fetch('/api/profile/dash', { method: 'PATCH', body: formData })
    await fetchProfile()
    avatarPreview.value = profile.value?.avatar || null
    Object.assign(state.value, updated.user)
    showToast('profileUpdated')
  }
  catch (error) {
    console.error('Error updating profile:', error)
    showToast('profileError')
  }
}

const handleKeyDown = (e: KeyboardEvent, fieldName: string) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    saveField(fieldName)
  }
  else if (e.key === 'Escape') {
    e.preventDefault()
    state.value[fieldName] = profile.value?.[fieldName as keyof User] ?? ''
    editingField.value = null
  }
}

const handleFocusOut = (section: HTMLElement | undefined) => {
  if (!section) return
  clearTimeout(blurTimeout)
  blurTimeout = setTimeout(() => {
    if (!section.contains(document.activeElement) && editingField.value) {
      stopEditing()
    }
  }, 100)
}
</script>

<template>
  <UModal :open="isOpen" :ui="{ content: 'p-3 sm:p-3 space-y-3 overflow-auto scroll' }">
    <template #content>
      <UPageCard variant="soft" :ui="{ root: 'w-full', container: 'w-full px-5 py-2.5 sm:px-5 sm:py-2.5' }">
        <UUser
          size="2xl"
          :name="state.name || ''"
          :description="state.country || state.city ? `${state.country}${state.country && state.city ? '/' : ''}${state.city}` : ''">
          <template #avatar>
            <div class="relative group size-18 rounded-full">
              <NuxtImg
                :src="avatarPreview || '/profile/blank.jpeg'"
                :provider="avatarPreview?.startsWith('http') ? undefined: 'cloudflare'"
                class="size-full rounded-full object-cover cursor-pointer transition-opacity duration-200 group-hover:opacity-50"
                @click="fileInput?.click()" />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div class=" rounded-full mt-5 text-white">
                  <UIcon name="i-lucide-camera" class="size-7" />
                </div>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange">
            </div>
          </template>
        </UUser>
        <UButton color="neutral" variant="link" :icon="ui.icons.close" class="absolute right-2 top-2" @click="$emit('update:isOpen', false)" />
      </UPageCard>
      <UPageCard
        v-for="section in sections"
        :key="section.title"
        variant="soft"
        :title="section.title"
        class="relative"
        :ui="{ container: 'px-5 py-2.5 sm:px-5 sm:py-2.5' }"
        @focusout="handleFocusOut(section.ref?.value)">
        <div class="grid grid-cols-1 gap-2 *:w-full">
          <template v-for="field in section.fields" :key="field.name">
            <UFormField :label="field.label" :ui="{ label: 'text-muted' }">
              <template #default>
                <div :class="['flex items-center gap-2', field.name === 'bio' ? 'col-span-2' : '']">
                  <UInput
                    v-if="editingField === field.name"
                    :id="`${field.name}-input`"
                    v-model="(state as Record<string, any>)[field.name]"
                    variant="none"
                    class="w-full border-b border-muted"
                    @keydown="(e: KeyboardEvent) => handleKeyDown(e, field.name)"
                    @blur="stopEditing" />
                  <div v-else class="relative w-full">
                    <p class="text-base w-40 break-words py-1 font-medium">
                      {{ state[field.name as keyof User] || 'Not set' }}
                    </p>
                    <UButton
                      color="neutral"
                      variant="link"
                      :icon="ui.icons.edit2"
                      class="absolute right-2 top-0"
                      @click="startEditing(field.name)" />
                  </div>
                </div>
              </template>
            </UFormField>
          </template>
        </div>
      </UPageCard>
    </template>
  </UModal>
</template>

<style scoped>
.scroll::-webkit-scrollbar{
  width: 3px;
}
.scroll::-webkit-scrollbar-thumb{
  background: #000
}
</style>
