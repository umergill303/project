<script lang="ts" setup>
import { useIntervalFn } from '@vueuse/core'
import type { OfferType } from '#shared/types/offer'
import { formatDate } from '#shared/utils/formatDate'

const { ui } = useAppConfig()
const emit = defineEmits(['delete', 'refresh'])
const props = defineProps<{ offersData: OfferType[], loading: boolean }>()

const recentlyChanged = ref<number[]>([])

const sortedOffers = computed(() => {
  return [...props.offersData].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1
    return (a.id ?? 0) - (b.id ?? 0)
  })
})

const offerActivations = async (offer: OfferType, newActiveState: boolean) => {
  await $fetch(`/api/offers/${offer.id}`, {
    method: 'PATCH',
    body: { active: newActiveState ? 1 : 0 }
  })
  emit('refresh')
  showToast(newActiveState ? 'offerActivation' : 'offerDectivation')
}

const toggleActivation = (offer: OfferType) => {
  const newActiveState = !offer.active
  offer.active = newActiveState
  recentlyChanged.value.push(Number(offer.id ?? 0))
  setTimeout(() => {
    recentlyChanged.value = recentlyChanged.value.filter(id => id !== Number(offer.id))
  }, 65 * 1000)
  offerActivations(offer, newActiveState)
}

useIntervalFn(() => {
  const now = new Date()
  props.offersData.forEach(async offer => {
    if (recentlyChanged.value.includes(Number(offer.id))) return

    const start = new Date(offer.startDate ?? '')
    const end = new Date(offer.endDate ?? '')
    const shouldBeActive = start <= now && now <= end
    if (offer.active !== shouldBeActive) {
      offer.active = shouldBeActive
      offerActivations(offer, shouldBeActive)
    }
  })
}, 60 * 1000)
</script>

<template>
  <div class="space-y-3 sm-w-full md:w-6/6 lg:w-3/3">
    <UCard
      v-for="offer in sortedOffers"
      :key="offer.id"
      class="border border-neutral rounded-lg p-0.5">
      <!-- Header -->
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold truncate">
          {{ offer.name }}
        </h3>
        <div class="flex items-center gap-2">
          <USwitch
            :model-value="offer.active ?? false"
            class="scale-90"
            @update:model-value="toggleActivation(offer)" />
          <UBadge variant="soft" color="primary" size="md">
            {{ offer.discount ?? 0 }}% OFF
          </UBadge>
        </div>
      </div>

      <!-- Dates -->
      <div class="flex items-center justify-between px-3 py-2 rounded mb-3">
        <p class="text-sm">
          {{ formatDate(offer.startDate ?? '') }}
        </p>
        <span class="text-sm mx-1">to</span>
        <p class="text-sm">
          {{ formatDate(offer.endDate ?? '') }}
        </p>
      </div>

      <!-- Description -->
      <div class="mb-3">
        <p
          v-if="offer.description"
          class="text-sm text-neutral line-clamp-2 truncate sm:line-clamp-3">
          {{ offer.description }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center">
        <UButton
          color="info"
          variant="ghost"
          size="sm"
          label="View products"
          :trailing-icon="ui.icons.arrowRightLine"
          :to="`/dashboard/voucher/products?id=${offer.id}`" />
        <div class="flex gap-2">
          <UButton
            color="info"
            variant="outline"
            size="xs"
            label="Edit"
            icon="i-lucide-square-pen"
            :to="`/dashboard/voucher/patch?id=${offer.id}`" />
          <UButton
            color="error"
            variant="outline"
            size="xs"
            label="Delete"
            icon="i-lucide-trash-2"
            @click="$emit('delete', offer.id)" />
        </div>
      </div>
    </UCard>
  </div>
</template>
