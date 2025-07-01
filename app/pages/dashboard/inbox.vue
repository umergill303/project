<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import type { Contact } from '~~/server/database/schema'

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' }
]

const page = ref(1)
const total = ref(0)
const limit = ref(20)
const selectedTab = ref('all')
const mails = ref<Contact[]>([])

const fetchContacts = async () => {
  const data = await $fetch<{ contacts: Contact[], totalContacts: number }>('/api/contact', {
    query: { page: page.value, limit: limit.value, unread: selectedTab.value === 'unread' ? 'true' : 'false' }
  })
  mails.value = data.contacts
  total.value = data.totalContacts
}

await fetchContacts()
console.log({ mails })

watch(page, () => { fetchContacts() })
const isPagination = computed(() => total.value > limit.value)

watch(selectedTab, () => {
  page.value = 1
  fetchContacts()
})

const filteredMails = computed(() => mails.value)

const selectedMail = ref<Contact | null>(null)
const selectedMailId = ref<string | null>(null)
const previousMailId = ref<string | null>(null)

watch(selectedMailId, async (newId, oldId) => {
  if (oldId) {
    await $fetch(`/api/contact/${oldId}`, { method: 'PATCH' })
    const index = mails.value.findIndex(m => m.id === oldId)
    if (index !== -1) { mails.value[index].unread = false }
    if (selectedTab.value === 'unread') { await fetchContacts() }
  }
  if (newId) {
    const { data } = await useFetch<{ success: boolean, contact: Contact }>(`/api/contact/${newId}`)
    selectedMail.value = data.value?.contact || null
  }
  else { selectedMail.value = null }
  previousMailId.value = oldId
})

const isMailPanelOpen = computed({
  get() { return !!selectedMailId.value },
  set(value: boolean) { if (!value) { selectedMailId.value = null } }
})

const breakPoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakPoints.smaller('lg')
</script>

<template>
  <UDashboardPanel id="inbox" :default-size="25" :min-size="20" :max-size="30" resizable>
    <UDashboardNavbar>
      <template #leading>
        <p class="font-medium">
          Inbox
        </p>
      </template>
      <template #trailing>
        <UBadge v-if="filteredMails.length > 0" :label="filteredMails.length" variant="subtle" />
      </template>
      <template #right>
        <UTabs v-model="selectedTab" :items="tabs" :content="false" class="w-32" size="xs" />
      </template>
    </UDashboardNavbar>
    <DashboardInboxList v-model="selectedMailId" :mails="filteredMails" />
    <DashboardPartialsPagination v-if="isPagination" v-model:page="page" :limit :total class="my-2" />
  </UDashboardPanel>

  <DashboardInboxMail v-if="selectedMail" :mail="selectedMail" @close="selectedMailId = null" />
  <div v-else class="hidden lg:flex flex-1 items-center justify-center">
    <UIcon name="i-lucide-inbox" class="size-32 text-dimmed" />
  </div>

  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isMailPanelOpen">
      <template #content>
        <DashboardInboxMail v-if="selectedMail" :mail="selectedMail" @close="selectedMailId = null" />
      </template>
    </USlideover>
  </ClientOnly>
</template>
