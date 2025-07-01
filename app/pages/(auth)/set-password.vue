<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })
const loading = ref(false)

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

type Schema = z.output<typeof schema>

// useSeoMeta({
//   title: 'Set Your Password – Secure Your Account ',
//   description: 'Create a strong password to protect your online shopping account. Enjoy a safe and seamless experience shopping for fashion, electronics, groceries, and more in Pakistan.'
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.setPasswordPageTitle || setPasswordPage.title, // Fallback title
  description: pageSeoData.value.setPasswordPageDescription || setPasswordPage.description, // Fallback description
})

const fields = [
  {
    name: 'password',
    type: 'password' as const,
    label: 'Password',
    placeholder: 'Enter Password',
    required: true
  },
  {
    name: 'confirmPassword',
    type: 'password' as const,
    label: 'Confirm Password',
    placeholder: 'Enter Confirm password',
    required: true
  }
]

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload.data)
  loading.value = true
  const res = await $fetch('/api/auth/set', {
    method: 'PATCH',
    body: payload.data,
  })
  console.log({ res })
  loading.value = false
  if (!res.success) {
    console.log('Success')
  }
  else {
    navigateTo('/')
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
          :loading
          title="Set Password"
          icon="i-lucide-lock"
          :fields
          :schema
          @submit="onSubmit" />
      </UPageCard>
    </UContainer>
  </UMain>
</template>
