<script setup lang="ts">
import { formField } from '~~/config/contact'
import { schema } from '~~/schema/contact.schema'
import { defaultProfile } from '~~/default/profile'

const loading = ref(false)
const state = ref<User>({ ...defaultProfile })

const contactForm = async () => {
  loading.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: state.value })
    state.value = { ...defaultProfile }
    showToast('messageSend')
  }
  catch { showToast('error') }
  finally { loading.value = false }
}

const { data } = await useFetch('/api/about')
const contactItems = [
  { title: 'Call Us', icon: 'i-lucide-phone', value: data.value?.contactPhone || 'Not Provided' },
  { title: 'Our Location', icon: 'i-lucide-map', value: data.value?.address || 'Not Provided' },
  { title: 'Working Hours', icon: 'i-lucide-alarm-clock', value: data.value?.businessHours || 'Not Provided' },
  { title: 'Our Email', icon: 'i-lucide-mail', value: data.value?.contactEmail || 'Not Provided' }
]
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.contactPageTitle || contactPage.title, // Fallback title
  description: pageSeoData.value.contactPageDescription || contactPage.description, // Fallback description
})
</script>

<template>
  <UContainer class="py-4 sm:py-6 lg:py-8 space-y-5">
    <AppBreadcrumbs />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 *:w-full">
      <UPageCard title="Send Us A Message" description="Any question or remarks? Just write us a message!">
        <UForm :schema="schema" :state @submit="contactForm">
          <div class="grid grid-cols-2 gap-3">
            <UFormField v-for="field in formField" :key="field.name" :name="field.name" :label="field.label" :class="['w-full', field.class]">
              <component
                :is="field.component"
                v-model="(state as Record<string, any>)[field.name]"
                :placeholder="field.placeholder"
                :type="field.type"
                :icon="field.icon"
                size="lg"
                class="w-full" />
            </UFormField>
          </div>

          <UButton
            block
            :loading
            size="lg"
            type="submit"
            label=" Contact Us"
            icon="i-lucide-contact"
            class="cursor-pointer mt-6" />
        </UForm>
      </UPageCard>
      <div>
        <UPageCard title="Contact Information" description="Get in touch with us through various channels">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(item, index) in contactItems" :key="index" class="space-y-2">
              <div class="flex items-start gap-2">
                <UIcon :name="item.icon" class="flex-shrink-0 w-5 h-5 text-primary mt-0.5" />
                <p class="text-sm font-medium">
                  {{ item.title }}
                </p>
              </div>
              <p class="text-sm ml-7 text-muted">
                {{ item.value }}
              </p>
            </div>
          </div>
        </UPageCard>
      </div>
    </div>
  </UContainer>
</template>
