<script setup lang="ts">
const { data } = await useFetch('/api/about')
// const { ui } = useAppConfig()
// useSeoMeta({
//   title: 'Privacy Policy – How We Protect Your Data ',
//   description: 'Read our Privacy Policy to understand how we collect, use, and protect your personal information. We are committed to ensuring your data is safe and secure while shopping online in Pakistan.'
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.privacyPolicyPageTitle || privacyPolicyPage.title, // Fallback title
  description: pageSeoData.value.privacyPolicyPageDescription || privacyPolicyPage.description, // Fallback description
})
</script>

<template>
  <UMain>
    <UContainer>
      <h1 class="text-3xl font-bold text-center mt-2">
        <UIcon name="i-lucide-shield-alert" class="text-blue-500 mr-2 size-7" />
        Privacy Policy
      </h1>
      <ProseP>
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you visit or make a purchase from <UButton size="xl" variant="link" :label="data.storeName || 'E-Shop'" />.
      </ProseP>
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-info" class="text-blue-500 mr-2 size-6" />
        Information We Collect
      </h2>
      <ProseP>
        We collect the following types of personal information:
      </ProseP>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-user" class="text-blue-500 mr-2" />
          <ProseStrong>Account Information:</ProseStrong>
          Name, email address, phone number, and password.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-credit-card" class="text-purple-500 mr-2" />
          <ProseStrong>Order Details:</ProseStrong>
          Shipping/billing address and payment method (handled securely via third-party providers).
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-bar-chart" class="text-green-500 mr-2" />
          <ProseStrong>Usage Data:</ProseStrong>
          IP address, browser type, pages visited, and time spent on site (for analytics).
        </ProseLi>
      </ProseUl>
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-list" class="text-green-500 mr-2 size-6" />
        How We Use Your Information
      </h2>
      <ProseP>
        Your information helps us:
      </ProseP>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-credit-card" class="text-purple-500 mr-2" />
          Process orders and payments
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-package" class="text-yellow-500 mr-2" />
          Deliver products and services
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-mail" class="text-blue-500 mr-2" />
          Send order confirmations and updates
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-headphones" class="text-green-500 mr-2" />
          Provide customer support
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-globe" class="text-teal-500 mr-2" />
          Improve our website and services
        </ProseLi>
      </ProseUl>
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-share" class="text-purple-500 mr-2 size-6" />
        Sharing Your Information
      </h2>
      <ProseP>
        We do not sell or rent your personal data. We may share information with:
      </ProseP>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-credit-card" class="text-purple-500 mr-2" />
          Payment gateways and delivery partners
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-shield" class="text-red-500 mr-2" />
          Legal authorities, if required by law
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-briefcase" class="text-blue-500 mr-2" />
          Service providers under contract to support our operations
        </ProseLi>
      </ProseUl>
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-shield" class="text-red-500 mr-2 size-6" />
        Data Security
      </h2>
      <ProseP>
        We use secure technologies (SSL encryption, access controls) to protect your data. However, no system is 100% secure.
      </ProseP>
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-cookie" class="text-yellow-500 mr-2 size-6" />
        Cookies and Tracking
      </h2>
      <ProseP>
        We use cookies and similar tools to:
      </ProseP>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-smile" class="text-yellow-500 mr-2" />
          Enhance your shopping experience
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-bar-chart" class="text-blue-500 mr-2" />
          Analyze site traffic
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-settings" class="text-green-500 mr-2" />
          Remember preferences
        </ProseLi>
      </ProseUl>
      <ProseP>
        You can control cookies via your browser settings.
      </ProseP>
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-check-circle" class="text-blue-500 mr-2 size-6" />
        Your Rights
      </h2>
      <ProseP>
        You have the right to:
      </ProseP>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-square-pen" class="text-blue-500 mr-2" />
          Access, update, or delete your data
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-mail" class="text-yellow-500 mr-2" />
          Opt out of marketing emails
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-x-circle" class="text-red-500 mr-2" />
          Withdraw consent where applicable
        </ProseLi>
      </ProseUl>
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-refresh-cw" class="text-blue-500 mr-2 size-6" />
        Changes to This Policy
      </h2>
      <ProseP>
        We may update this policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.
      </ProseP>
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-mail" class="text-green-500 mr-2 size-6" />
        Contact Us
      </h2>
      <ProseP>
        If you have any questions, please contact us at:
      </ProseP>

      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-mail" class="text-blue-500 mr-2" />
          <ProseStrong>Email:</ProseStrong>  {{ data?.contactEmail || 'Your Email Address' }}
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-map-pin" class="text-green-500 mr-2" />
          <ProseStrong>Address:</ProseStrong> {{ data?.address || 'Your Business Address' }}
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-phone" class="text-blue-500 mr-2" />
          <ProseStrong>Phone:</ProseStrong> {{ data?.contactPhone || 'Your Phone Number' }}
        </ProseLi>
      </ProseUl>
    </UContainer>
  </UMain>
</template>
