<script setup lang="ts">
definePageMeta({ layout: 'dev' })
const route = useRoute()
const { data: page } = await useAsyncData(() => queryCollection('content').path(route.path).first())

useSeoMeta({
  title: page.value?.title,
  description: page.value?.description
})
</script>

<template>
  <UContainer
    class="border-x border-(--ui-border) overflow-auto h-screen">
    <ContentRenderer v-if="page" :value="page" />
    <div v-else>
      Page not found
    </div>
  </UContainer>
</template>
