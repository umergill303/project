<script lang="ts" setup>
import { pageSeo } from '~~/config/pageSeo'
import { usePageSeo } from '~/composables/usePageSeo'

interface Page {
  title: string
  desc: string
  pageTitle: string
  pageDescription: string
}

const modalOpen = ref(false)
const selectedPage = ref({})

const { pageSeoData, fetchPageSeo, refresh } = usePageSeo()
fetchPageSeo()

const selectPolicy = (page: Page) => {
  selectedPage.value = page
  modalOpen.value = true
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="font-medium">
        Page SEO
      </p>
      <p class="text-sm text-muted font-medium mt-1">
        Add title and description for each page to improve SEO.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <UPageCard
        v-for="(page, i) in pageSeo"
        :key="i"
        variant="soft"
        class="group cursor-pointer shadow-sm"
        @click="selectPolicy(page)">
        <div class="flex items-center gap-2">
          <UIcon :name="page.icon" class="size-8" />
          <div class="flex-1">
            <p class="font-medium">
              {{ page.title }}
            </p>
            <p class="text-sm font-medium text-muted">
              {{ page.desc }}
            </p>
          </div>
        </div>
      </UPageCard>
    </div>

    <DashboardSettingSeoModal v-model:is-open="modalOpen" :page="selectedPage" :seo-data="pageSeoData" @refresh="refresh" />
  </div>
</template>
