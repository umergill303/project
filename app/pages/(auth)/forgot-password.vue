<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })

const toast = useToast()
const loading = ref(false)

const schema = usernameSchema

// useSeoMeta({
//   title: 'Forgot Password - Reset Your Account Password',
//   description: 'Easily reset your account password to regain access to your online shopping account. Follow simple steps for a quick and secure password recovery.',
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.forgotPasswordPageTitle || forgotPasswordPage.title, // Fallback title
  description: pageSeoData.value.forgotPasswordPageDescription || forgotPasswordPage.description, // Fallback description
})

type Schema = z.output<typeof schema>
const errors = ref<string[]>([])
const fields = [{
  name: 'username',
  type: 'text' as const,
  label: 'User Name',
  placeholder: 'Enter your User Name',
  required: true,
}]

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    const response = await $fetch('/api/auth/forgot', {
      method: 'POST',
      body: data,
    })

    // The backend now always sends a generic success message to prevent user enumeration.
    toast.add({
      title: 'Request Sent',
      description: response.message, // Use the generic message from the backend
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    // Navigate to the OTP verification page
    await navigateTo('/verify-forgot')
  }
  catch (error: any) {
    // Catch errors explicitly thrown by createError from the backend
    console.error('Forgot password request failed:', error)

    const errorMessage = error.data?.statusMessage || error.message || 'An unexpected error occurred. Please try again later.'

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
          title="Forgot Password"
          :fields="fields"
          :schema="schema"
          icon="i-lucide-lock"
          :loading="loading"
          submit-button-text="Send OTP"
          @submit="onSubmit">
          <template #description>
            Enter your username to receive an OTP on your registered phone number or email.
          </template>
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
