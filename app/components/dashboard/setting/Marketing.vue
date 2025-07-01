<script lang="ts" setup>
import { Marketing } from '~~/config/about'
import { useAbout } from '~/composables/useAbout'

const saving = ref(false)
const newSocialUrl = ref('')
const { ui } = useAppConfig()
const selectedSocial = ref('')
const isModalOpen = ref(false)
const state = ref<Record<string, string | number | boolean>>({})
const originalState = ref<Record<string, string | number | boolean>>({})

const hasLinkError = ref(false)
const linkErrorMessage = ref('')
const isCheckingLink = ref(false)

const { aboutData, fetchAbout } = useAbout()

onMounted(async () => {
  await fetchAbout()
  state.value = { ...aboutData.value }
  originalState.value = { ...aboutData.value }
})

watch(aboutData, newData => {
  state.value = { ...newData }
  originalState.value = { ...newData }
})

// Select Social
const selectSocial = (socialKey: string) => {
  selectedSocial.value = socialKey
  newSocialUrl.value = String(state.value[socialKey] || '')
  hasLinkError.value = false
  linkErrorMessage.value = ''
}

// Utility to validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  }
  catch { return false }
}

// Utility to validate social media URL
const validateSocialUrl = (url: string, socialKey: string) => {
  if (!isValidUrl(url)) return false

  const socialConfig = Marketing[0]?.keys.find(s => s.key === socialKey)
  if (!socialConfig?.domains) return true

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const hostname = urlObj.hostname.replace('www.', '')

    return socialConfig.domains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    )
  }
  catch {
    return false
  }
}

// Utility to format URL (add https:// if missing)
const formatSocialUrl = (url: string) => {
  if (!url) return url
  return url.startsWith('http') ? url : `https://${url}`
}

// Check Link Exists
const checkLinkExists = async (url: string) => {
  isCheckingLink.value = true
  hasLinkError.value = false
  linkErrorMessage.value = ''

  // First validate URL format
  if (!isValidUrl(url)) {
    hasLinkError.value = true
    linkErrorMessage.value = 'Please enter a valid URL (e.g., https://example.com)'
    isCheckingLink.value = false
    return false
  }

  // Format URL for validation
  const formattedUrl = formatSocialUrl(url)

  // Then validate social media domain
  if (!validateSocialUrl(formattedUrl, selectedSocial.value)) {
    const socialConfig = Marketing[0]?.keys.find(s => s.key === selectedSocial.value)
    const socialName = socialConfig?.label || 'selected platform'
    const exampleDomain = socialConfig?.domains?.[0] || 'example.com'

    hasLinkError.value = true
    linkErrorMessage.value = `Please enter a valid ${socialName} URL (e.g., https://${exampleDomain})`
    isCheckingLink.value = false
    return false
  }

  // Then proceed with the existence check
  try {
    const response = await fetch(formattedUrl, { method: 'HEAD', mode: 'no-cors' })
    if (response.ok || response.status === 0) return true

    hasLinkError.value = true
    linkErrorMessage.value = 'This URL does not seem to respond.'
    return false
  }
  catch {
    hasLinkError.value = true
    linkErrorMessage.value = 'Could not verify the URL. Please check it manually.'
    return false
  }
  finally {
    isCheckingLink.value = false
  }
}

// Save New Social
const saveNewSocial = async () => {
  if (!selectedSocial.value || !newSocialUrl.value.trim()) return

  // Format the URL before validation
  newSocialUrl.value = formatSocialUrl(newSocialUrl.value)

  // Show loading state while checking URL
  isCheckingLink.value = true
  const isValid = await checkLinkExists(newSocialUrl.value)
  isCheckingLink.value = false

  if (!isValid) return

  if (saving.value) return
  saving.value = true

  try {
    const formData = new FormData()
    formData.append(selectedSocial.value, newSocialUrl.value)
    await $fetch('/api/about', { method: 'PATCH', body: formData })
    await fetchAbout()
    originalState.value[selectedSocial.value] = newSocialUrl.value
    showToast('aboutUpdated')
    isModalOpen.value = false
    selectedSocial.value = ''
    newSocialUrl.value = ''
  }
  catch { showToast('error') }
  finally { saving.value = false }
}

// Available Socials
const availableSocials = computed(() => {
  return Marketing[0]?.keys.filter(social => !state.value[social.key] || state.value[social.key] === '')
})

// Delete Social
const deleteSocial = async (key: string) => {
  if (saving.value) return
  saving.value = true

  try {
    await $fetch('/api/about', { method: 'PATCH', body: { [key]: '' } })
    state.value[key] = ''
    originalState.value[key] = ''
    showToast('aboutUpdated')
  }
  catch { showToast('error') }
  finally { saving.value = false }
}
</script>

<template>
  <UForm :state>
    <UPageCard
      v-for="section in Marketing"
      :key="section.title"
      variant="soft"
      :ui="{ root: 'shadow-sm', header: 'flex justify-between items-center w-full' }">
      <template #header>
        <div class="flex gap-2 items-center">
          <div class="bg-primary/5 border border-primary/25 rounded px-2 flex items-center justify-center py-1">
            <UIcon :name="section.icon" class="size-7" :style="{ color: `${section.iconColor}` }" />
          </div>
          <div class="font-medium">
            <p>
              {{ section.title }}
            </p>
            <p class="text-sm text-muted">
              {{ section.description }}
            </p>
          </div>
        </div>
        <UButton label="Add Profile" :icon="ui.icons.add" color="primary" @click="isModalOpen = true" />
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <UFormField v-for="field in section.keys.filter(f => state[f.key])" :key="field.key" :label="field.label">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon :name="field.icon" class="size-7 flex-shrink-0" :style="{ color: field.color }" />
                <p class="text-base break-all line-clamp-2 min-w-0">
                  {{ (state as Record<string, any>)[field.key] || 'Not set' }}
                </p>
              </div>
            </div>
            <div v-if="state[field.key]" class="flex justify-end">
              <UButton
                size="xs"
                color="primary"
                variant="link"
                label="Visit"
                :to="state[field.key]"
                target="_blank"
                :icon="ui.icons.external"
                class="text-xs" />
              <UButton
                color="info"
                variant="link"
                label="Edit"
                :icon="ui.icons.edit2"
                @click="() => {
                  selectedSocial = field.key
                  newSocialUrl = String(state[field.key] || '')
                  isModalOpen = true
                }" />
              <UButton
                color="error"
                variant="link"
                label="Delete"
                icon="i-lucide-trash-2"
                @click="deleteSocial(field.key)" />
            </div>
          </div>
        </UFormField>
      </div>
    </UPageCard>
  </UForm>

  <UModal
    :open="isModalOpen"
    :close="{ color: 'neutral', variant: 'link', onClick: () => { isModalOpen = false; selectedSocial = ''; newSocialUrl= '' } }"
    :title="selectedSocial ? `Add ${Marketing[0]?.keys.find(s => s.key === selectedSocial)?.label} URL` : 'Add Social Media Profile'">
    <template #body>
      <div class="space-y-6">
        <p class="text-sm mb-4">
          Select a social media platform
        </p>
        <div class="flex overflow-auto scroll gap-2">
          <UButton
            v-for="social in availableSocials"
            :key="social.key"
            color="neutral"
            :variant="selectedSocial === social.key ? 'subtle' : 'soft'"
            class="p-2"
            @click="selectSocial(social.key)">
            <template #leading>
              <UIcon :name="social.icon" class="size-8" :style="{ color: `${social.color}` }" />
            </template>
          </UButton>
        </div>

        <div>
          <div class="w-full relative">
            <UInput
              v-model="newSocialUrl"
              type="url"
              size="xl"
              :placeholder="selectedSocial ? `Enter ${Marketing[0]?.keys.find(s => s.key === selectedSocial)?.label} URL` : 'https://...'"
              class="w-full">
              <UButton
                :loading="isCheckingLink || saving"
                :icon="ui.icons.add"
                class="px-4 absolute right-2"
                @click="saveNewSocial" />
            </UInput>
          </div>

          <p v-if="hasLinkError" class="text-error font-medium text-sm mt-2">
            {{ linkErrorMessage }}
          </p>
        </div>

        <p v-if="availableSocials?.length === 0" class="text-center py-4">
          All available social media profiles have been added.
        </p>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.scroll::-webkit-scrollbar{
  display:none;
}
</style>
