<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })
const route = useRoute()
console.log(route.query.next)
const next = route.query.next as string || '/'

// useSeoMeta({
//   title: 'Create Your Account - Register for Online Shopping in Pakistan',
//   description: 'Sign up quickly and securely to start shopping the latest fashion, electronics, groceries, and more. Enjoy exclusive deals and fast delivery across Pakistan.'
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.registerPageTitle || registerPage.title, // Fallback title
  description: pageSeoData.value.registerPageDescription || registerPage.description, // Fallback description
})

const toast = useToast()
const loading = ref(false)

// --- Form Field Definitions ---
// Only Username and Password fields are displayed for registration
const fields = [
  {
    name: 'username',
    type: 'text' as const,
    label: 'Choose a Username',
    placeholder: 'e.g., your_username_123',
    required: true
  },
  {
    name: 'password',
    label: 'Create Password',
    type: 'password' as const,
    placeholder: 'Must be at least 8 characters',
    required: true
  }
]

// Social login providers (if you have them configured)
const providers = [
  {
    label: 'Google',
    icon: 'i-bxl-google',
    to: '/api/auth/google',
    size: 'lg',
    external: true
  }
]
const errors = ref<string[]>([])
// --- Zod Validation Schema ---
// Only Username and Password are validated for this registration form
const schema = userRegisterSchema

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      body: payload.data,
    })

    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
      toast.add({
        title: res.message || 'Account successfully created!',
        color: 'primary',
        icon: 'i-lucide-circle-check',
      })

      await navigateTo(next)
    }
    else {
      // Handle non-2xx responses from your API
      toast.add({
        title: res.message || 'Registration failed. Please check your details.',
        color: 'error',
        icon: 'i-lucide-info',
      })
    }
  }
  catch (error: any) { // As requested, using 'any'. For better type safety, 'unknown' is recommended.
    console.error('Registration error:', error)
    const errorMessage = error.data?.message || 'Something went wrong. Please try again.'
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
          title="Create Your Account"
          icon="i-lucide-lock"
          :schema
          :fields
          :providers
          :loading
          @submit="onSubmit">
          <template #description>
            Already have an account?
            <ULink to="/login" class="text-primary font-medium">Login now</ULink>
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
            By signing up, you agree to our
            <ULink to="#" class="text-primary font-medium">Terms of Service</ULink>.
          </template>
        </UAuthForm>
      </UPageCard>
    </UContainer>
  </UMain>
</template>
