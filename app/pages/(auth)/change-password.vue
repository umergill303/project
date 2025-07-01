<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })

const loading = ref(false)
const toast = useToast()

const schema = userChangePasswordSchema

// useSeoMeta({
//   title: 'Change Password - Secure Your Account',
//   description: 'Update your account password easily and securely to protect your personal information and shopping data. Keep your online shopping experience safe with us.',
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.changePasswordPageTitle || changePasswordPage.title, // Fallback title
  description: pageSeoData.value.changePasswordPageDescription || changePasswordPage.description, // Fallback description
})

type Schema = z.output<typeof schema>
const errors = ref<string[]>([])
const fields = [
  {
    name: 'password',
    type: 'password' as const,
    label: 'Current Password',
    placeholder: 'Enter Current Password',
    required: true,
  },
  {
    name: 'newPassword',
    type: 'password' as const,
    label: 'New Password',
    placeholder: 'Enter New Password',
    required: true,
  },
  {
    name: 'confirmPassword',
    type: 'password' as const,
    label: 'Confirm Password',
    placeholder: 'Enter Confirm Password',
    required: true,
  },
]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const response = await $fetch('/api/auth/change', {
      method: 'POST',
      body: event.data,
    })

    // If the API returns success, show a success toast and navigate
    toast.add({
      title: 'Success!',
      description: response.message || 'Password changed successfully.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })
    navigateTo('/')
  }
  catch (error: any) {
    // Handle errors thrown by useDb or createError from the backend
    console.error('Password change failed:', error)

    const errorMessage = error.data?.statusMessage || error.message || 'An unexpected error occurred.'

    errors.value.push(errorMessage)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UMain>
    <UContainer class="min-h-screen flex items-center justify-center py-4 sm:py-6 lg:py-8">
      <UPageCard class="w-full max-w-md">
        <AppBreadcrumbs class="absolute top-2 left-2" />
        <UColorModeButton class="absolute top-2 right-2" />
        <UAuthForm
          title="Change Password"
          icon="i-lucide-lock"
          :fields="fields"
          :schema="schema"
          :loading="loading"
          submit-button-text="Change Password"
          @submit="onSubmit">
          <template #validation>
            <UAlert
              v-for="(error, index) in errors"
              :key="index"
              color="error"
              icon="i-lucide-info"
              :title="error" />
          </template>
        </UAuthForm>
      </UPageCard>
    </UContainer>
  </UMain>
</template>
