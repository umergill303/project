<script setup lang="ts">
const { fetchProfile } = useProfile()
await fetchProfile()
onMounted(async () => {
  await $fetch('/api/visitors/track', { method: 'POST' }).catch(console.error)
})
</script>

<template>
  <UPage>
    <AppHeader />
    <slot />
    <AppFooter />
  </UPage>
</template>
