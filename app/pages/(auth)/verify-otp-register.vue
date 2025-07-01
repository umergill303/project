<script setup lang="ts">
definePageMeta({ layout: false })

const loading = ref(false)
const otp = ref<string[]>([])
const toast = useToast()
// useSeoMeta({
//   title: 'Verify Password OTP – Secure Your Account ',
//   description: 'Enter the verification code to confirm your password reset request and regain secure access to your online shopping account. Quick and safe process for customers in Pakistan.'
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.verifyOtpPageTitle || verifyOtpPage.title, // Fallback title
  description: pageSeoData.value.verifyOtpPageDescription || verifyOtpPage.description, // Fallback description
})

async function verify() {
  loading.value = true
  const code = otp.value.join('') // Combine the digits into full OTP
  console.log('Verifying OTP:', code)

  try {
    const res = await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: { otp: code }, // No phone number needed; server uses cookie
    })

    if (!res.success) {
      toast.add({ title: res.message || 'Verification failed', color: 'error', icon: 'i-lucide-info' })
    }
    else {
      toast.add({ title: res.message, color: 'primary', icon: 'i-lucide-circle-check' })
      await navigateTo('/login')
    }
  }
  catch {
    toast.add({ title: 'Unexpected error during verification', color: 'error', icon: 'i-lucide-info' })
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
        <UPinInput
          v-model="otp"
          :highlight="loading"
          :disabled="loading"
          variant="subtle"
          otp
          required
          type="number"
          :length="5"
          placeholder="_"
          @complete="verify" />

        <UButton
          :loading
          :disabled="loading || otp.length !== 5"
          class="mt-4"
          @click="verify">
          Verify OTP
        </UButton>

        <p>OTP sent to your registered phone number.</p>
        <p>Check your SMS for the OTP.</p>
      </UPageCard>
    </UContainer>
  </UMain>
</template>
