<script setup lang="ts">
// TODO: fetch app title
const config = useRuntimeConfig()
config.public.site = { name: appSeo.title }
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <DevOnly>
      <UPageCard variant="subtle" class="fixed top-20 right-10">
        <UButton label="Dev Zone" to="/dev" />
      </UPageCard>
    </DevOnly>
  </UApp>
</template>
