<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })
const { refreshCart, refreshWish } = useCount()
const toast = useToast()
const { fetch: refreshSession } = useUserSession()
const loading = ref(false)

// useSeoMeta({
//   title: 'Login to Your Account - Secure Access',
//   description: 'Sign in to your account securely to manage orders, track shipments, and enjoy personalized shopping experiences on Pakistan’s trusted online store.',
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.loginPageTitle || loginPage.title, // Fallback title
  description: pageSeoData.value.loginPageDescription || loginPage.description, // Fallback description
})

const fields = [
  {
    name: 'username',
    type: 'text' as const,
    label: 'User Name',
    placeholder: 'Enter your User Name',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password',
    required: true, // Added required to password field
  },
  {
    name: 'remember',
    label: 'Remember me',
    defaultValue: true,
    type: 'checkbox' as const,
  },
]

const providers = [
  {
    label: 'Google',
    icon: 'i-bxl-google',
    to: '/api/auth/google',
    size: 'xl' as const,
    external: true,
  },
]
const errors = ref<string[]>([])
const schema = userLoginSchema

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: payload.data,
    })

    // If we reach here, the login was successful as the backend would have thrown an error otherwise
    toast.add({
      title: 'Login Successful!',
      description: response.message || 'Welcome back!', // Use message from backend if available
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    await refreshSession() // Refresh the client-side session data
    await navigateTo('/')
    refreshCart()
    refreshWish() // Redirect to the home page
  }
  catch (error: any) {
    // Handle errors thrown by useDb or createError from the backend
    console.error('Login failed:', error)

    // Extract the statusMessage from the error data, or fall back to generic messages
    const errorMessage = error.data?.statusMessage || error.message || 'An unexpected error occurred during login.'
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
          :schema="schema"
          :fields="fields"
          :providers="providers"
          title="Welcome back!"
          icon="i-lucide-lock"
          :loading="loading"
          submit-button-text="Login"
          @submit="onSubmit">
          <template #description>
            Don't have an account? <ULink to="/register" class="text-primary font-medium">Sign up</ULink>.
          </template>
          <template #password-hint>
            <ULink to="/forgot-password" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
          </template>
          <template #validation>
            <UAlert
              v-for="(error, index) in errors"
              :key="index"
              color="error"
              icon="i-lucide-info"
              :title="error" />
          </template>
          <template #footer>
            By signing in, you agree to our <ULink to="/terms-and-conditions" class="text-primary font-medium">Terms of Service</ULink>.
          </template>
        </UAuthForm>
      </UPageCard>
    </UContainer>
  </UMain>
</template>
