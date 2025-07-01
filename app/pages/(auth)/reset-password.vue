<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })

const loading = ref(false)
const toast = useToast()

// Enhanced schema with password matching validation
const schema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'], // This points the error to the confirmPassword field
})

// useSeoMeta({
//   title: 'Reset Password - Securely Update Your Password',
//   description: 'Reset your account password easily and securely to regain access and protect your personal information. Fast and safe password recovery for all users in Pakistan.'
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.resetPasswordPageTitle || resetPasswordPage.title, // Fallback title
  description: pageSeoData.value.resetPasswordPageDescription || resetPasswordPage.description, // Fallback description
})

type Schema = z.output<typeof schema>

const fields = [
  {
    name: 'newPassword',
    type: 'password' as const,
    label: 'New Password',
    placeholder: 'Enter new password',
    required: true,
  },
  {
    name: 'confirmPassword',
    type: 'password' as const,
    label: 'Confirm Password',
    placeholder: 'Confirm new password',
    required: true,
  }
]

// Check for the presence of the reset token on page load
onMounted(async () => {
  try {
    // Try to get some info to confirm the reset session is active
    // We don't need to get the token value, just check if the session is valid
    await $fetch('/api/auth/get-reset-session-status', { method: 'GET' })
    // If the above call succeeds, the session is active.
  }
  catch (error: any) {
    console.error('Reset session invalid:', error)
    const errorMessage = error.data?.statusMessage || error.message || 'Your password reset link is invalid or has expired. Please restart the process.'
    toast.add({
      title: 'Session Expired',
      description: errorMessage,
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error',
    })
    // Redirect back to the forgot password initiation page
    setTimeout(() => {
      navigateTo('/forgot-password')
    }, 2000)
  }
})

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    const response = await $fetch('/api/auth/reset', {
      method: 'POST',
      body: payload.data, // This includes newPassword and confirmPassword
    })

    toast.add({
      title: 'Password Reset Successful!',
      description: response.message,
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    // Redirect to login page after successful reset
    await navigateTo('/login')
  }
  catch (error: any) {
    console.error('Password reset failed:', error)
    const errorMessage = error.data?.statusMessage || error.message || 'An unexpected error occurred during password reset.'

    toast.add({
      title: 'Reset Failed',
      description: errorMessage,
      icon: 'i-heroicons-x-circle',
      color: 'error',
    })
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
          :fields
          :schema
          :loading
          submit-button-text="Set New Password"
          @submit="onSubmit">
          <template #description>
            Enter and confirm your new password.
          </template>
        </UAuthForm>
      </UPageCard>
    </UContainer>
  </UMain>
</template>
