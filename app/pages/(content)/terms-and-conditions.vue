<script setup lang="ts">
const { data } = await useFetch('/api/about')
// useSeoMeta({
//   title: 'Terms and Conditions – User Agreement ',
//   description: 'Read the Terms and Conditions governing the use of our online store. Understand your rights, responsibilities, and policies for a safe and transparent shopping experience in Pakistan.'
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.termsConditionsPageTitle || termsConditionsPage.title, // Fallback title
  description: pageSeoData.value.termsConditionsPageDescription || termsConditionsPage.description, // Fallback description
})
</script>

<template>
  <UMain>
    <UContainer>
      <!-- H1 with Icon -->
      <h1 class="text-3xl font-bold text-center mt-2">
        <UIcon name="i-lucide-file-text" class="text-blue-500 mr-2 size-7" />
        Terms & Conditions
      </h1>

      <ProseP>
        Welcome to <UButton size="xl" variant="link" :label="data.storeName || 'E-Shop'" /> These Terms & Conditions outline the rules and regulations for using our website and services.

        By accessing or using our website, you agree to be bound by these terms. If you disagree with any part of the terms, please do not use our site.
      </ProseP>

      <!-- H2 with Icons -->
      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-info" class="text-green-500 mr-2 size-6" />
        General Information
      </h2>
      <ProseP>
        This website is owned and operated by<UButton size="xl" variant="link" :label="data.storeName || 'E-Shop'" />. Throughout the site, the terms "we", "us", and "our" refer to <UButton size="xl" variant="link" :label="data.storeName || 'E-Shop'" />. By visiting our site and/or purchasing something from us, you engage in our "Service".
      </ProseP>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-user-check" class="text-blue-500 mr-2 size-6" />
        Eligibility
      </h2>
      <ProseP>
        By using this site, you confirm that you are at least the age of majority in your country, or that you have given us your consent to allow any of your minor dependents to use this site.
      </ProseP>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-tag" class="text-purple-500 mr-2 size-6" />
        Products & Pricing
      </h2>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-check-circle" class="text-green-500 mr-2" />
          By using this site, you confirm that you are at least the age of majority in your country, or that you have given us your consent to allow any of your minor dependents to use this site.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-alert-circle" class="text-yellow-500 mr-2" />
          We reserve the right to modify or discontinue a product or service at any time without prior notice.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-info" class="text-blue-500 mr-2" />
          We do not guarantee that descriptions, prices, or other content on the website are accurate, complete, reliable, current, or error-free.
        </ProseLi>
      </ProseUl>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-credit-card" class="text-blue-500 mr-2 size-6" />
        Orders & Payments
      </h2>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-x-circle" class="text-red-500 mr-2" />
          We reserve the right to refuse any order for any reason.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-edit" class="text-green-500 mr-2" />
          You agree to provide current, complete, and accurate purchase and account information.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-shield" class="text-purple-500 mr-2" />
          Orders may be cancelled or limited at our discretion, including orders placed using the same customer account, credit card, or billing/shipping address.
        </ProseLi>
      </ProseUl>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-truck" class="text-yellow-500 mr-2 size-6" />
        Shipping & Delivery
      </h2>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-clock" class="text-blue-500 mr-2" />
          Shipping times may vary depending on your location.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-alert-triangle" class="text-red-500 mr-2" />
          We are not responsible for delays caused by third-party couriers or customs.
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-mail" class="text-green-500 mr-2" />
          Once your order is shipped, you will receive a tracking number via email.
        </ProseLi>
      </ProseUl>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-refresh-cw" class="text-blue-500 mr-2 size-6" />
        Returns & Refunds
      </h2>
      <ProseP>
        Please refer to our <UButton to="/return-and-refund-policy" variant="link" label="Return & Refund Policy" />  page for detailed information on returning items and requesting refunds.
      </ProseP>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-user-x" class="text-red-500 mr-2 size-6" />
        User Conduct
      </h2>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-alert-octagon" class="text-red-500 mr-2" />
          Any unlawful purpose
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-user-minus" class="text-yellow-500 mr-2" />
          To solicit others to perform or participate in unlawful acts
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-globe" class="text-blue-500 mr-2" />
          To violate any international, federal, or local regulations or laws
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-copyright" class="text-purple-500 mr-2" />
          To infringe upon or violate our intellectual property rights
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-alert-circle" class="text-red-500 mr-2" />
          To submit false or misleading information
        </ProseLi>
      </ProseUl>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-shield" class="text-green-500 mr-2 size-6" />
        Intellectual Property
      </h2>
      <ProseP>
        All content on this website (including logos, graphics, images, and text) is the property of {{ data.storeName || "Your Store Name" }} and is protected by copyright and trademark laws. Unauthorized use of any content is prohibited.
      </ProseP>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-alert-triangle" class="text-red-500 mr-2 size-6" />
        Limitation of Liability
      </h2>
      <ProseP>
        We are not liable for any direct, indirect, incidental, or consequential damages that result from your use of or inability to use the website or services, including but not limited to delays, data loss, or service interruptions.
      </ProseP>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-refresh-cw" class="text-blue-500 mr-2 size-6" />
        Changes to Terms
      </h2>
      <ProseP>
        We reserve the right to update or change these Terms & Conditions at any time. Changes will take effect immediately upon posting on the site. Your continued use of the site means you accept those changes.
      </ProseP>

      <h2 class="font-bold text-xl flex items-center">
        <UIcon name="i-lucide-mail" class="text-green-500 mr-2 size-6" />
        Contact Us
      </h2>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-mail" class="text-blue-500 mr-2" />
          <ProseStrong>Email:</ProseStrong>  {{ data.contactEmail || 'Your Email Address' }}
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-map-pin" class="text-green-500 mr-2" />
          <ProseStrong>Address:</ProseStrong> {{ data.address || 'Your Business Address' }}
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-phone" class="text-green-500 mr-2" />
          <ProseStrong>Phone:</ProseStrong> {{ data.contactPhone || 'Your Phone Number' }}
        </ProseLi>
      </ProseUl>
    </UContainer>
  </UMain>
</template>
