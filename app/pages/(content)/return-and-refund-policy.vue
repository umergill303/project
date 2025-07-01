<script setup lang="ts">
const { data } = await useFetch('/api/about')
// useSeoMeta({
//   title: 'Return & Refund Policy – Hassle-Free Returns and Refunds',
//   description: 'Review our Return & Refund Policy to learn about our easy return process, refund eligibility, and timelines. Shop with confidence knowing your satisfaction is our priority.'
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.returnPolicyPageTitle || returnPolicyPage.title, // Fallback title
  description: pageSeoData.value.returnPolicyPageDescription || returnPolicyPage.description, // Fallback description
})
</script>

<template>
  <UMain>
    <UContainer>
      <!-- H1 with Icon -->
      <h1 class="text-3xl font-bold text-center mt-2">
        <UIcon name="i-lucide-package" class="text-blue-500 mr-2 size-7" />
        Return & Refund Policy
      </h1>

      <ProseP>
        Thank you for shopping with us! We want you to love your purchase, but if something isn't right, we're here to help.
      </ProseP>

      <!-- H2 with Icons -->
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-check-circle" class="text-green-500 mr-2 size-6" />
        Returns
      </h2>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-clock" class="text-blue-500 mr-2" />
          <ProseStrong>Eligibility Window:</ProseStrong> You can request a return within 7 days of receiving your order.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-repeat" class="text-purple-500 mr-2" />
          <ProseStrong>Return Process:</ProseStrong>
          <ProseUl>
            <ProseLi>
              <UIcon name="i-lucide-mail" class="text-green-500 mr-2" />
              Contact our support team at <UButton size="xl" variant="link" :label="data.storeName || 'E-Shop'" /> with your order ID and reason for return.
            </ProseLi>
            <ProseLi>
              <UIcon name="i-lucide-map-pin" class="text-blue-500 mr-2" />
              We will provide you with return instructions and address.
            </ProseLi>
            <ProseLi>
              <UIcon name="i-lucide-check" class="text-green-500 mr-2" />
              Once we receive the item and inspect it, we will process your refund or exchange.
            </ProseLi>
          </ProseUl>
        </ProseLi>
      </ProseUl>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-dollar-sign" class="text-yellow-500 mr-2 size-6" />
        Refunds
      </h2>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-clock" class="text-blue-500 mr-2" />
          <ProseStrong>Processing Time:</ProseStrong> Once your return is approved, your refund will be processed within 5-7 business days.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-credit-card" class="text-purple-500 mr-2" />
          <ProseStrong>Original Payment Method:</ProseStrong> Refunds will be credited to your original method of payment.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-truck" class="text-red-500 mr-2" />
          <ProseStrong>Shipping Charges:</ProseStrong> Original shipping fees are non-refundable. Return shipping is the customer’s responsibility unless the item was defective or damaged.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-alert-circle" class="text-yellow-500 mr-2" />
          <ProseStrong>Partial Refunds:</ProseStrong> In some cases, only partial refunds may be granted for:
          <ProseUl>
            <ProseLi>
              <UIcon name="i-lucide-alert-triangle" class="text-red-500 mr-2" />
              Items with obvious signs of use
            </ProseLi>
            <ProseLi>
              <UIcon name="i-lucide-x-circle" class="text-purple-500 mr-2" />
              Any item not in its original condition
            </ProseLi>
          </ProseUl>
        </ProseLi>
      </ProseUl>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-refresh-cw" class="text-green-500 mr-2 size-6" />
        Exchanges
      </h2>
      <ProseP>
        If you received a defective or damaged item and need to exchange it for the same item, contact us at {{ data.contactEmail || 'Your Email Address' }} and we’ll make it right.
      </ProseP>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-help-circle" class="text-blue-500 mr-2 size-6" />
        Need Help?
      </h2>
      <ProseP>
        If you have any questions about our return and refund policy, feel free to reach out to our support team at {{ data.contactEmail || 'Your Email Address' }} or through our {{ data.contactPhone || 'Your Phone Number' }} page.
      </ProseP>
    </UContainer>
  </UMain>
</template>
