<script lang="ts" setup>
import { z } from 'zod'
import { getProfileFields } from '~~/config/profile'
import { defaultProfile } from '~~/default/profile'

const { session } = useUserSession()
const profileFields = getProfileFields()

// Define Zod schema with enhanced validation
const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .refine(async username => {
      if (!username || username === initialState.value.username) return true
      try {
        const res = await $fetch('/api/profile/user', {
          method: 'POST',
          body: { username }
        })
        return res.available
      }
      catch {
        return false
      }
    }, 'This username is already in use')
    .transform(username => username.trim().toLowerCase())
    .refine(username => {
      return !initialState.value.username || !!username
    }, 'Username cannot be removed'),

  email: z.string()
    .transform(email => email.trim())
    .refine(email => {
      if (!email && initialState.value.email) return false
      if (!email) return true
      return /.+@.+\..+/.test(email)
    }, 'Please enter a valid email address')
    .refine(async email => {
      if (!email || email === initialState.value.email) return true
      try {
        const res = await $fetch('/api/profile/user', {
          method: 'POST',
          body: { email }
        })
        return res.available
      }
      catch {
        return false
      }
    }, 'This email is already in use')
    .optional(),

  phone: z.string()
    .transform(phone => phone.trim())
    .refine(phone => {
      if (!phone && initialState.value.phone) return false
      if (!phone) return true
      return phone.length >= 11 && phone.length <= 15
    }, 'Phone number must be between 11-15 digits or leave empty')
    .refine(async phone => {
      if (!phone || phone === initialState.value.phone) return true
      try {
        const res = await $fetch('/api/profile/user', {
          method: 'POST',
          body: { phone }
        })
        return res.available
      }
      catch {
        return false
      }
    }, 'This phone number is already in use')
    .optional(),

  country: z.string().optional(),
  city: z.string().optional(),
  gender: z.string().optional(),
  bio: z.string().optional(),
})

definePageMeta({ layout: false })
const { features } = useRuntimeConfig().public.ecommerce
const loading = ref(false)
// useSeoMeta({
//   title: 'Your Profile – Manage Account & Orders',
//   description: 'View and update your personal information, manage your orders, and track your shopping history securely on Pakistan’s trusted online store.'
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.profilePageTitle || profilePage.title, // Fallback title
  description: pageSeoData.value.profilePageDescription || profilePage.description, // Fallback description
})

const hasPassword = computed(() => {
  return session.value?.user?.password !== ''
})

const initialState = ref({ ...defaultProfile })
const state = reactive({ ...defaultProfile })

const hasChanges = computed(() => {
  return Object.keys(defaultProfile).some(key => {
    const stateValue = state[key] ?? null
    const initialValue = initialState.value[key] ?? null
    return stateValue !== initialValue
  })
})

const { data: profile, error: profileError, refresh: fetchProfile } = await useFetch('/api/profile', {
  transform: data => {
    return { ...defaultProfile, ...data }
  }
})

watch(profile, newProfile => {
  if (newProfile) {
    Object.assign(state, newProfile)
    initialState.value = { ...newProfile }
  }
}, { immediate: true })

if (profileError.value) {
  console.error('Failed to load profile:', profileError.value)
  showToast('profileLoadError')
}

const avatar = ref<File | null>(null)
const avatarPreview = ref<string | null>(profile.value?.avatar || null)
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const isDeleting = ref(false)
const editingField = ref<string | null>(null)
const formErrors = ref<Record<string, string>>({})

const triggerAvatarUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (!file.type.match('image.*')) {
    showToast('avatarFileSelect')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast('avatarSize')
    return
  }

  avatar.value = file
  avatarPreview.value = URL.createObjectURL(file)
  await uploadAvatar()
}

const uploadAvatar = async () => {
  if (!avatar.value) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', avatar.value)
    formData.append('data', JSON.stringify(state))

    const response = await $fetch('/api/profile', {
      method: 'PATCH',
      body: formData
    })

    if (response.success) {
      showToast('avatarUpdated')
      await fetchProfile()
      if (profile.value?.avatar) {
        avatarPreview.value = profile.value.avatar
      }
      avatar.value = null
      fileInput.value && (fileInput.value.value = '')
    }
    else {
      throw new Error(response.message || 'Failed to upload avatar')
    }
  }
  catch (error) {
    console.error('Error uploading avatar:', error)
    showToast(error instanceof Error ? error.message : 'avatarError')
    avatarPreview.value = profile.value?.avatar || null
  }
  finally {
    isUploading.value = false
  }
}

const removeAvatar = async () => {
  isDeleting.value = true
  try {
    const response = await $fetch('/api/profile/avatar', {
      method: 'DELETE'
    })

    if (response.success) {
      showToast('avatarRemoved')
      avatarPreview.value = null
      avatar.value = null
      fileInput.value && (fileInput.value.value = '')
      await fetchProfile()
    }
    else {
      throw new Error(response.message || 'Failed to remove avatar')
    }
  }
  catch (error) {
    console.error('Error removing avatar:', error)
    showToast(error instanceof Error ? error.message : 'avatarRemoveError')
    avatarPreview.value = profile.value?.avatar || null
  }
  finally {
    isDeleting.value = false
  }
}

const startEditing = (fieldName: string) => {
  editingField.value = fieldName
  formErrors.value[fieldName] = ''
  nextTick(() => {
    const input = document.getElementById(`${fieldName}-input`)
    input?.focus()
    if (input instanceof HTMLInputElement) {
      input.selectionStart = input.selectionEnd = input.value.length
    }
  })
}

const stopEditing = async (fieldName: string) => {
  editingField.value = null
  try {
    const singleSchema = z.object({ [fieldName]: profileSchema.shape[fieldName] })
    await singleSchema.parseAsync({ [fieldName]: state[fieldName] ?? '' })
    formErrors.value[fieldName] = ''
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      formErrors.value[fieldName] = error.errors[0].message
      showToast(error.errors[0].message)
    }
  }
}

const handleKeyDown = (e: KeyboardEvent, fieldName: string) => {
  if (e.key === 'Escape') {
    e.preventDefault()
    state[fieldName] = initialState.value[fieldName] || ''
    editingField.value = null
    formErrors.value[fieldName] = ''
  }
}

const updateProfile = async () => {
  loading.value = true
  formErrors.value = {}

  try {
    // Validate the entire form
    const validationResult = await profileSchema.safeParseAsync({
      ...state,
      email: state.email ?? '',
      phone: state.phone ?? '',
      username: state.username ?? ''
    })
    if (!validationResult.success) {
      validationResult.error.errors.forEach(err => {
        formErrors.value[err.path[0]] = err.message
        showToast(err.message)
      })
      return
    }

    const payload = { ...state }
    // Only convert empty strings to null for non-required fields
    Object.keys(payload).forEach(key => {
      if (key !== 'email' && key !== 'phone' && key !== 'username' && payload[key] === '') {
        payload[key] = null
      }
    })

    const updatedProfile = await $fetch('/api/profile/user', {
      method: 'POST',
      body: payload
    })

    if (updatedProfile.success) {
      Object.assign(state, updatedProfile.data)
      initialState.value = { ...updatedProfile.data }
      await fetchProfile()
      showToast('profileUpdated')
    }
    else {
      throw new Error(updatedProfile.message || 'Failed to update profile')
    }
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        formErrors.value[err.path[0]] = err.message
        showToast(err.message)
      })
    }
    else {
      console.error('Error updating profile:', error)
      showToast(error instanceof Error ? error.message : 'profileError')
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UMain v-if="features.auth">
    <UContainer class="py-6 sm:py-8 lg:py-10">
      <AppBreadcrumbs class="mb-6" />
      <div class="mx-auto max-w-5xl">
        <section class="flex flex-col gap-8 md:flex-row">
          <!-- Profile Card -->
          <UCard
            variant="subtle"
            class="w-full md:w-1/3 bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden"
            :ui="{ body: 'space-y-8 p-6' }">
            <div class="relative text-center">
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept="image/*"
                @change="handleFileChange">

              <div class="relative group mx-auto w-36 h-36">
                <NuxtImg
                  :src="avatarPreview || profile?.avatar || '/profile/blank.jpeg'"
                  :provider="(avatarPreview || profile?.avatar)?.startsWith('https') ? undefined : 'cloudflare'"
                  alt="Profile Picture"
                  class="w-36 h-36 rounded-full object-cover border-4 border-white dark:border-neutral-700 shadow-md transition-transform duration-300 group-hover:scale-105" />
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  @click="triggerAvatarUpload">
                  <UIcon name="i-lucide-camera" class="size-8 text-white" />
                </div>
              </div>
              <div class="mt-4 flex justify-center gap-3">
                <UButton
                  color="primary"
                  variant="solid"
                  size="sm"
                  label="Upload"
                  :loading="isUploading"
                  icon="i-lucide-upload"
                  class="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 transition-colors duration-200"
                  @click="triggerAvatarUpload" />
                <UButton
                  v-if="avatarPreview || profile?.avatar"
                  color="red"
                  variant="solid"
                  size="sm"
                  label="Remove"
                  :loading="isDeleting"
                  icon="i-lucide-trash"
                  class="bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 transition-colors duration-200"
                  @click="removeAvatar" />
              </div>
            </div>

            <div class="text-center space-y-2">
              <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ state.name || 'Your Name' }}
              </h1>
              <p v-if="state.username" class="text-gray-500 dark:text-gray-400 text-sm">
                @{{ state.username }}
              </p>
              <p v-if="state.gender" class="text-gray-500 dark:text-gray-400 text-sm">
                {{ state.gender }}
              </p>
              <p v-if="state.bio" class="text-gray-600 dark:text-gray-300 text-sm max-w-xs mx-auto">
                {{ state.bio }}
              </p>
            </div>

            <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div v-if="state.email" class="flex items-center gap-3">
                <UIcon name="i-lucide-mail" class="size-5 text-blue-500 flex-shrink-0" />
                <p class="truncate">
                  {{ state.email }}
                </p>
              </div>
              <div v-if="state.phone" class="flex items-center gap-3">
                <UIcon name="i-lucide-phone" class="size-5 text-blue-500 flex-shrink-0" />
                <p>{{ state.phone }}</p>
              </div>
              <div v-if="state.country || state.city" class="flex items-center gap-3">
                <UIcon name="i-lucide-map-pin" class="size-5 text-blue-500 flex-shrink-0" />
                <p>
                  {{ state.country }}{{ state.country && state.city ? ', ' : '' }}
                  {{ state.city }}
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <UButton
                block
                color="neutral"
                variant="outline"
                icon="i-lucide-lock"
                :to="hasPassword ? '/change-password' : '/set-password'"
                :label="hasPassword ? 'Change Password' : 'Set Password'"
                class="border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors duration-200" />
              <UButton
                block
                to="/orders"
                color="neutral"
                variant="outline"
                label="View Orders"
                icon="i-lucide-shopping-bag"
                class="border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors duration-200" />
            </div>
          </UCard>

          <!-- Edit Form -->
          <UCard
            class="w-full md:w-2/3 bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden"
            :ui="{ body: 'p-6' }">
            <UForm :schema="profileSchema" :state="state" @submit.prevent>
              <h2 class="mb-8 text-2xl font-semibold text-gray-900 dark:text-white text-center">
                Edit Profile
              </h2>

              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <template v-for="(field, index) in profileFields" :key="index">
                    <UFormField
                      :label="field.label"
                      :name="field.name"
                      :ui="{ container: 'w-full', label: 'text-gray-700 dark:text-gray-200 font-medium', error: 'text-red-500 text-sm mt-1' }">
                      <template #default>
                        <component
                          :is="field.component"
                          v-bind="field.props"
                          :id="`${field.name}-input`"
                          v-model="(state as Record<string, any>)[field.name]"
                          class="w-full rounded-lg border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          @focus="startEditing(field.name)"
                          @blur="stopEditing(field.name)"
                          @keydown="(e: KeyboardEvent) => handleKeyDown(e, field.name)" />
                      </template>
                    </UFormField>
                  </template>
                </div>

                <div class="mt-8 flex justify-end">
                  <UButton
                    type="button"
                    color="primary"
                    variant="solid"
                    label="Save Changes"
                    :loading="loading"
                    :disabled="!hasChanges || loading"
                    class="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-2 text-base font-medium transition-colors duration-200"
                    @click="updateProfile" />
                </div>
              </div>
            </UForm>
          </UCard>
        </section>
      </div>
    </UContainer>
  </UMain>
</template>

<style scoped>
/* Custom hover effects for buttons */
button:hover {
  transform: translateY(-1px);
}
button:active {
  transform: translateY(0);
}
</style>
