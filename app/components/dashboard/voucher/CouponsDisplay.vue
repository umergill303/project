<script lang="ts" setup>
import { useIntervalFn } from '@vueuse/core'
import { formatDate } from '#shared/utils/formatDate'
import type { Coupon } from '~~/server/database/schema'

const { ui } = useAppConfig()
const props = defineProps<{ coupons: Coupon[] }>()
const emit = defineEmits(['delete', 'modal', 'refresh'])

const recentlyChanged = ref<number[]>([])

const sortedCoupons = computed(() => {
  return [...props.coupons].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1
    return (a.id ?? 0) - (b.id ?? 0)
  })
})

const couponActivations = async (coupon: Coupon) => {
  await $fetch(`/api/coupons/${coupon.id}`, {
    method: 'PATCH',
    body: { active: coupon.active ? 1 : 0 }
  })
  emit('refresh')
  showToast(coupon.active ? 'couponActivation' : 'couponDeactivated')
}

const toggleActivation = (coupon: Coupon) => {
  coupon.active = !coupon.active
  recentlyChanged.value.push(Number(coupon.id ?? 0))
  setTimeout(() => {
    recentlyChanged.value = recentlyChanged.value.filter(id => id !== Number(coupon.id))
  }, 65 * 1000)
  couponActivations(coupon)
}

useIntervalFn(() => {
  const now = new Date()
  props.coupons.forEach(async coupon => {
    if (recentlyChanged.value.includes(Number(coupon.id))) return

    const start = new Date(coupon.startDate ?? '')
    const end = new Date(coupon.endDate ?? '')
    const shouldBeActive = start <= now && now <= end
    if (coupon.active !== shouldBeActive) {
      coupon.active = shouldBeActive
      await couponActivations(coupon)
    }
  })
}, 60 * 1000)
</script>

<template>
  <div class="space-y-3">
    <UCard
      v-for="coupon in sortedCoupons"
      :key="coupon.id"
      class="border rounded-lg  ">
      <!-- Header -->
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold truncate">
          {{ coupon.code }}
        </h3>
        <div class="flex items-center gap-2">
          <USwitch
            :model-value="coupon.active ?? false"
            class="scale-90"
            @update:model-value="toggleActivation(coupon)" />
          <UBadge color="primary" variant="subtle" size="sm">
            {{ coupon.discount ?? 0 }}% OFF
          </UBadge>
          <div class="flex flex-wrap gap-2 ">
            <UBadge
              v-if="coupon.firstOrderOnly"
              size="sm"
              color="warning"
              variant="subtle"
              label="First order only" />
            <UBadge
              v-if="coupon.minOrderAmount"
              size="sm"
              color="warning"
              variant="subtle"
              :label="`Min. order: $${coupon.minOrderAmount}`" />
          </div>
        </div>
      </div>

      <!-- Badges -->

      <!-- Dates -->
      <div class="flex items-center justify-between  px-3 py-2 rounded mb-3">
        <p class="text-sm">
          {{ formatDate(coupon.startDate ?? '') }}
        </p>
        <span class="text-sm mx-1">to</span>
        <p class="text-sm">
          {{ formatDate(coupon.endDate ?? '') }}
        </p>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <p
          v-if="coupon.description"
          class="text-sm text-neutral line-clamp-2 sm:line-clamp-3">
          {{ coupon.description }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center">
        <div class="flex gap-2">
          <UButton
            color="info"
            variant="subtle"
            size="sm"
            label="Edit"
            icon="i-lucide-square-pen"
            @click="$emit('modal', coupon)" />
          <UButton
            color="error"
            variant="subtle"
            size="sm"
            label="Delete"
            icon="i-lucide-trash-2"
            @click="$emit('delete', coupon.id)" />
        </div>
      </div>
    </UCard>
  </div>
</template>
