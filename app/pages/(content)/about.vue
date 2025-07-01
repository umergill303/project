<script setup lang="ts">
const { data } = await useFetch('/api/about')
// useSeoMeta({
//   title: 'About Us – Trusted Online Shopping Platform in Pakistan',
//   description: 'Learn about our mission, values, and commitment to delivering the best online shopping experience in Pakistan. Discover why thousands trust us for fashion, electronics, groceries, and more.'
// })

// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.aboutPageTitle || aboutPage.title, // Fallback title
  description: pageSeoData.value.aboutPageDescription || aboutPage.description, // Fallback description
})
</script>

<template>
  <UMain>
    <UContainer>
      <h1 class="text-3xl font-bold text-center mt-2">
        <UIcon name="i-lucide-info" class="text-green-500 mr-2 size-7" />
        About Us
      </h1>
      <ProseP>
        Welcome to <UButton size="xl" variant="link" :label="data.storeName || 'E-Shop'" /> your one-stop destination for high-quality products and a seamless shopping experience!

        We are passionate about delivering the best to our customers—whether it’s trendy fashion, everyday essentials, or unique finds, our goal is to bring you a carefully curated collection that fits your style and needs.
      </ProseP>
      <ProseP>
        At <UButton size="xl" variant="link" :label="data.storeName || 'E-Shop'" />, we believe in:
      </ProseP>
      <ProseUl>
        <ProseLi>
          <UIcon name="i-lucide-check" class="text-green-500 " />
          Top-quality products
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-truck" class="text-yellow-500" />
          Fast and reliable delivery
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-lock" class="text-blue-700" />
          Safe and secure shopping
        </ProseLi>
        <ProseLi>
          <UIcon name="i-lucide-handshake" class="text-amber-300" />
          Excellent customer service
        </ProseLi>
      </ProseUl>
      <ProseP>
        Every product in our store is chosen with love and attention to detail. We aim to make online shopping easy, enjoyable, and trustworthy for everyone.

        Thank you for choosing us. We’re here to serve you with care and dedication, and we’re always just a message away if you need any help!
      </ProseP>

      <h2 class="font-bold">
        Happy Shopping !   <UIcon name="i-lucide-smile" class="text-yellow-500" />
      </h2>
    </UContainer>
  </UMain>
</template>
