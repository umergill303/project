<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui'
import { $fetch } from 'ofetch'
import type { Order, User } from '~~/server/database/schema'

const route = useRoute()
const id = (route.params as { id: string }).id

const page = ref(1)
const total = ref(15)
const limit = ref(5)
const totalPurchase = ref(0)
const orders = ref<Order[]>([])
const customer = ref<User | null>(null)

const fetchCustomerData = async () => {
  try {
    const data = await $fetch<{ orders: Order[], customer: User & { totalOrders: number }, totalPurchase: number }>
    (`/api/customers/${id}`, { params: { page: page.value, limit: limit.value } })
    orders.value = data.orders
    customer.value = data.customer
    console.log('customer', customer.value)
    console.log('orders', orders.value)
    total.value = data.customer.totalOrders
    totalPurchase.value = data.totalPurchase
  }
  catch { console.log('Error fetching customer data') }
}
await fetchCustomerData()
watch([page], () => { fetchCustomerData() })

const isPagination = computed(() => total.value > limit.value)

const items: TabsItem[] = [
  { label: 'About', icon: 'i-lucide-user-round', slot: 'about' },
  { label: 'History', icon: 'i-lucide-history', slot: 'history' }
]

// const DDitems = ref<DropdownMenuItem[]>([
//   { label: 'Send message', icon: ui.icons.send },
//   { label: 'Suspend customer', icon: 'i-basil-user-block-outline', onSelect: () => updateStatus('suspended') },
//   { label: 'Baned customer', icon: 'i-mdi-ban', onSelect: () => updateStatus('banned') },
// ])

const analytic = computed(() => (
  [
    { name: total.value.toString(), description: 'Total Orders', avatar: { icon: 'i-lucide-shopping-bag' } },
    { name: formatCurrency(totalPurchase.value || 0), description: 'Total Purchase', avatar: { icon: 'i-lucide-chart-column' } },
  ]
))

// const _updateStatus = async (status: 'active' | 'suspended' | 'banned') => {
//   try {
//     await $fetch(`/api/customers/${id}`, { method: 'PATCH', body: { status } })
//     showToast('customerUpdated')
//   }
//   catch { showToast('error') }
// }
</script>

<template>
  <UDashboardPanel id="customer profile" :ui="{ body: '' }">
    <template #header>
      <UDashboardNavbar :ui="{ right: '*:cursor-pointer *:shadow-sm' }">
        <template #leading>
          <AppBreadcrumbs />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex gap-5 font-medium">
        <ClientOnly>
          <NuxtImg
            :src="customer?.avatar || '/profile/blank.jpeg'"
            :provider="((customer?.avatar === '') || customer?.avatar?.startsWith('http')) ? undefined :'cloudflare'"
            class="rounded-md shadow size-24 sm:size-30 md:size-40 object-cover" />
        </ClientOnly>
        <div class="space-y-3 w-full md:w-1/5 flex flex-col justify-between">
          <div class="flex flex-col gap-2">
            <p>{{ customer?.name ?? '' }}</p>
            <p>{{ customer?.bio }}</p>
            <!-- <UDropdownMenu :items="DDitems" :content="{ align: 'start', side: 'left', sideOffset: 8 }" :ui="{ content: 'w-48' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
            </UDropdownMenu> -->
          </div>
          <div class="flex gap-3">
            <UUser v-for="(item, index) in analytic" :key="index" v-bind="item" :ui="{ root: 'flex', wrapper: 'py-0.5 px-4 bg-elevated/50 rounded', name: 'flex justify-center', description: 'text-nowrap' }" />
          </div>
        </div>
      </div>

      <UTabs :items variant="link">
        <template #about>
          <DashboardCustomersAbout v-if="customer" :customer />
        </template>
        <template #history>
          <DashboardCustomersHistory v-if="orders" :orders />
          <DashboardPartialsPagination v-if="isPagination" v-model:page="page" :total :limit />
        </template>
      </UTabs>
    </template>
  </UDashboardPanel>
</template>
