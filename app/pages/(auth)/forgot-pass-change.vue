<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })
const loading = ref(false)

const schema = userResetPasswordSchema

// useSeoMeta({
//   title: 'Forgot Password – Reset Your Account Password',
//   description: 'Easily reset your account password to regain access to your online shopping account. Follow simple steps for a quick and secure password recovery.'
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
  const res = await $fetch('/api/auth/change-forgot', {
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
    <UContainer class="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
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
