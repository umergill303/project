<script setup lang="ts">
definePageMeta({ layout: false })

const loading = ref(false)
const otp = ref<string[]>([])
const toast = useToast()

const maskedContactMethod = ref('')
const otpSentMethod = ref<'phone' | 'email' | 'none'>('none')
const hasValidContactMethod = ref(false) // New ref to track if a valid method was found

const OTP_LENGTH = 6 // Matching your backend's 6-digit OTP generation

// useSeoMeta({
//   title: 'Verify Password Reset – Secure Your Account',
//   description: 'Enter the verification code to confirm your password reset request and regain secure access to your online shopping account. Quick and safe process for customers in Pakistan.',
// })

// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.verifyPasswordPageTitle || verifyPasswordPage.title, // Fallback title
  description: pageSeoData.value.verifyPasswordPageDescription || verifyPasswordPage.description, // Fallback description
})
// On component mount, fetch the contact info from the backend API
onMounted(async () => {
  try {
    const response = await $fetch('/api/auth/get-forgot-info', { method: 'GET' })

    otpSentMethod.value = response.method
    maskedContactMethod.value = response.maskedTarget

    // Determine if a valid contact method was found (not 'none' and not 'N/A')
    hasValidContactMethod.value = otpSentMethod.value !== 'none' && maskedContactMethod.value !== 'N/A'

    // If no valid contact method, inform the user immediately
    if (!hasValidContactMethod.value) {
      toast.add({
        title: 'No Contact Method Found',
        description: 'We could not find an associated phone number or email for OTP delivery. Please contact support.',
        icon: 'i-heroicons-exclamation-circle',
        color: 'warning',
        timeout: 7000, // Give user time to read before redirect
      })
      // Optionally redirect back to forgot-password or contact page after a delay
      setTimeout(() => {
        navigateTo('/forgot-password') // Or '/contact'
      }, 5000)
    }
  }
  catch (error: any) {
    console.error('Failed to load forgot password info:', error)
    const errorMessage = error.data?.statusMessage || error.message || 'Unable to retrieve session details. Please restart the forgot password process.'
    toast.add({
      title: 'Session Error',
      description: errorMessage,
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error',
    })
    setTimeout(() => {
      navigateTo('/forgot-password') // Redirect back if session info is invalid/expired
    }, 2000)
  }
})

async function verify() {
  // Prevent verification attempt if no valid contact method was found
  if (!hasValidContactMethod.value) {
    toast.add({
      title: 'Action Not Possible',
      description: 'An OTP could not be sent to your account. Please contact support.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error',
    })
    return
  }

  loading.value = true
  const code = otp.value.join('')

  if (code.length !== OTP_LENGTH) {
    toast.add({
      title: 'Invalid OTP length',
      description: `Please enter a ${OTP_LENGTH}-digit code.`,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    loading.value = false
    return
  }

  try {
    const response = await $fetch('/api/auth/verify-forgot', {
      method: 'POST',
      body: { otp: code },
    })

    toast.add({
      title: 'Success!',
      description: response.message || 'OTP verified successfully.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    await navigateTo('/reset-password')
  }
  catch (error: any) {
    console.error('OTP verification failed:', error)
    const errorMessage = error.data?.statusMessage || error.message || 'An unexpected error occurred during verification.'

    toast.add({
      title: 'Verification Failed',
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

        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Account
          </h2>
          <p class="text-gray-500 dark:text-gray-400">
            <template v-if="hasValidContactMethod">
              Please enter the {{ OTP_LENGTH }}-digit code sent to
              <template v-if="otpSentMethod === 'phone'">
                your phone number <span class="font-semibold text-primary">{{ maskedContactMethod }}</span>.
              </template>
              <template v-else-if="otpSentMethod === 'email'">
                your email address <span class="font-semibold text-primary">{{ maskedContactMethod }}</span>.
              </template>
              <template v-else>
                <span class="font-semibold text-primary">{{ maskedContactMethod }}</span>.
              </template>
            </template>
            <template v-else>
              We could not find a registered phone number or email associated with this account to send an OTP.
              Please
              <ULink to="/contact" class="text-primary font-medium">contact support</ULink>
              for assistance.
            </template>
          </p>
        </div>

        <template v-if="hasValidContactMethod">
          <UPinInput
            v-model="otp"
            :highlight="loading"
            :disabled="loading"
            variant="subtle"
            otp
            required
            type="number"
            :length="OTP_LENGTH"
            placeholder="_"
            @complete="verify" />

          <UButton
            :loading="loading"
            :disabled="loading || otp.length !== OTP_LENGTH"
            class="mt-4 w-full justify-center"
            size="lg"
            @click="verify">
            Verify OTP
          </UButton>

          <div class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Didn't receive the code?
            <ULink to="/forgot-password" class="text-primary font-medium">Try again</ULink>
          </div>
        </template>
      </UPageCard>
    </UContainer>
  </UMain>
</template>
