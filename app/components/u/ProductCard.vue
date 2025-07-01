<!-- <script setup lang="ts">
interface Props {
  thumbnail: string
  id?: string
  to?: string
  name?: string
  price?: number | string
  salePrice?: number | string
  label?: string
  inWish?: boolean
  quickViewIcon?: boolean
  quickViewBtn?: boolean
  cartIcon?: boolean
  cartBtn?: boolean
  whatsApp?: boolean
  lowStock?: boolean
  rating?: number
  sold?: number
  shipping?: boolean
  shippingMsg?: string
  freeShipping?: boolean
  discountPercentage?: number
  provider?: string
}

withDefaults(defineProps<Props>(), {
  name: undefined,
  price: undefined,
  salePrice: 0,
  label: undefined,
  inWish: undefined,
  quickViewIcon: false,
  quickViewBtn: false,
  cartIcon: false,
  cartBtn: false,
  whatsApp: false,
  lowStock: false,
  rating: undefined,
  sold: 0,
  shipping: false,
  shippingMsg: undefined,
  freeShipping: false,
  discountPercentage: undefined,
})

const emit = defineEmits(['wish'])
</script>

<template>
  <UCard variant="soft" :ui="{ body: 'p-0 sm:p-0' }" aria-labelledby="product-title">
    <div class="relative">
      <NuxtLink :to>
        <NuxtImg
          :provider="provider!"
          :src="thumbnail"
          alt="product thumbnail"
          class="aspect-8/7 w-80 object-cover rounded-t-[calc(var(--ui-radius)*2)] bg-(--ui-border-accented)"
          loading="lazy" />
      </NuxtLink>

      <UBadge v-if="label" :label size="lg" class="absolute top-2 left-2" />

      <UBadge
        v-if="discountPercentage > 0"
        color="error"
        :label="discountPercentage + '% OFF'"
        class="cursor-pointer absolute size-xs top-2 left-2" />

      <div class="flex flex-col gap-2 absolute top-2 right-2">
        <UButton
          v-if="inWish !== undefined"
          icon="i-lucide-heart"
          :color="inWish ? 'success' : 'neutral'"
          variant="solid"
          :aria-label="inWish ? 'Remove from wishlist' : 'Add to wishlist'"
          class="cursor-pointer "
          @click="emit('wish', id)" />
        <UButton
          v-if="cartIcon"
          icon="i-zmdi-shopping-cart-plus"
          color="neutral"
          class="cursor-pointer " />
        <UButton
          v-if="quickViewIcon"
          icon="i-lucide-eye"
          color="neutral"
          class="cursor-pointer " />
      </div>
    </div>
    <UButton
      v-if="quickViewBtn"
      label="Quick View"
      icon="i-lucide-eye"
      block
      color="neutral"
      variant="solid"
      class="rounded-none cursor-pointer" />
    <div class="p-2">
      <NuxtLink v-if="name" :to class="text-sm md:text-lg font-semibold line-clamp-2">
        {{ name }}
      </NuxtLink>
      <div v-if="price || salePrice" class="font-medium flex items-center gap-1">
        <span class="text-sm md:text-lg">
          {{ salePrice }}
        </span>
        <span v-if="salePrice && price && discountPercentage > 0" class="text-sm text-muted line-through mt-1">
          {{ price }}
        </span>
      </div>
      <div v-if="shipping" class="flex items-center gap-1">
        <UIcon
          name="i-material-symbols-light-delivery-truck-speed"
          class="size-8"
          :class="{ 'text-(--ui-color-success-500)': freeShipping }" />
        <span class="text-sm text-muted">
          {{ shippingMsg || (freeShipping ? 'Free Shipping' : '') }}
        </span>
      </div>
      <UButton
        v-if="cartBtn"
        label="Add to cart"
        icon="i-zmdi-shopping-cart-plus"
        variant="solid"
        color="neutral"
        block
        class="cursor-pointer" />
      <UButton
        v-if="whatsApp"
        label="WhatsApp"
        icon="i-logos-whatsapp-icon"
        variant="solid"
        color="neutral"
        block
        class="cursor-pointer" />
      <div v-if="lowStock || rating || sold" class="flex justify-between items-center">
        <UBadge v-if="lowStock" label="Low stock" color="error" variant="soft" />
        <span v-else />
        <div class="flex items-center gap-1 text-muted">
          <span v-if="sold" class="text-sm">{{ sold }}+ sold </span>
          <template v-if="rating">
            <span v-if="sold">|</span>
            <UIcon name="i-noto-star" class="size-3" />
            <p class="font-semibold">
              {{ rating }}
            </p>
          </template>
        </div>
      </div>
    </div>
  </UCard>
</template> -->
<script setup lang="ts">
interface Props {
  thumbnail: string
  id?: string
  to?: string
  name?: string
  price?: number | string
  salePrice?: number | string
  label?: string
  inWish?: boolean
  quickViewIcon?: boolean
  quickViewBtn?: boolean
  cartIcon?: boolean
  cartBtn?: boolean
  whatsApp?: boolean
  lowStock?: boolean
  rating?: number
  sold?: number
  shipping?: boolean
  shippingMsg?: string
  freeShipping?: boolean
  discountPercentage?: number
  provider?: string
}

withDefaults(defineProps<Props>(), {
  name: undefined,
  price: undefined,
  salePrice: 0,
  label: undefined,
  inWish: undefined,
  quickViewIcon: false,
  quickViewBtn: false,
  cartIcon: false,
  cartBtn: false,
  whatsApp: false,
  lowStock: false,
  rating: undefined,
  sold: 0,
  shipping: false,
  shippingMsg: undefined,
  freeShipping: false,
  discountPercentage: undefined,
})

const emit = defineEmits(['wish'])
</script>

<template>
  <UCard variant="soft" :ui="{ body: 'p-0 sm:p-0' }" aria-labelledby="product-title" class="w-full max-w-[20rem] box-border">
    <div class="relative">
      <NuxtLink v-if="to" :to="to">
        <NuxtImg
          :provider="provider!"
          :src="thumbnail"
          alt="product thumbnail"
          class="w-full aspect-[8/7] object-cover rounded-t-[calc(var(--ui-radius)*2)] bg-[var(--ui-border-accented)]"
          loading="lazy" />
      </NuxtLink>

      <UBadge v-if="label" :label="label" size="lg" class="absolute top-2 left-2 max-w-[4rem] text-xs" />

      <UBadge
        v-if="discountPercentage > 0"
        color="error"
        :label="discountPercentage + '% OFF'"
        class="absolute top-2 left-2 max-w-[4rem] text-xs cursor-pointer" />

      <div class="flex flex-col gap-1 sm:gap-2 absolute top-2 right-2">
        <UButton
          v-if="inWish !== undefined"
          icon="i-lucide-heart"
          :color="inWish ? 'success' : 'neutral'"
          variant="solid"
          :aria-label="inWish ? 'Remove from wishlist' : 'Add to wishlist'"
          class="cursor-pointer size-xs sm:size-sm"
          @click="emit('wish', id)" />
        <UButton
          v-if="cartIcon"
          icon="i-zmdi-shopping-cart-plus"
          color="neutral"
          class="cursor-pointer size-xs sm:size-sm" />
        <UButton
          v-if="quickViewIcon"
          icon="i-lucide-eye"
          color="neutral"
          class="cursor-pointer size-xs sm:size-sm" />
      </div>
    </div>
    <UButton
      v-if="quickViewBtn"
      label="Quick View"
      icon="i-lucide-eye"
      block
      color="neutral"
      variant="solid"
      class="rounded-none cursor-pointer text-sm sm:text-base" />
    <div class="p-2 sm:p-4">
      <NuxtLink v-if="name && to" :to="to" class="text-sm sm:text-base font-semibold line-clamp-2 text-ellipsis overflow-hidden">
        {{ name }}
      </NuxtLink>
      <div v-if="price || salePrice" class="font-medium flex items-center gap-1 sm:gap-2 min-w-0 max-w-[content]">
        <span class="text-sm md:text-lg">
          {{ salePrice }}
        </span>
        <span v-if="salePrice && price && discountPercentage > 0" class="text-sm sm:text-base text-ellipsis overflow-hidden line-through ">
          {{ price }}
        </span>
      </div>
      <div v-if="shipping" class="flex items-center gap-1 sm:gap-2">
        <UIcon
          name="i-material-symbols-light-delivery-truck-speed"
          class="size-6 sm:size-8"
          :class="{ 'text-[var(--ui-color-success-500)]': freeShipping }" />
        <span class="text-xs sm:text-sm text-muted">
          {{ shippingMsg || (freeShipping ? 'Free Shipping' : '') }}
        </span>
      </div>
      <UButton
        v-if="cartBtn"
        label="Add to cart"
        icon="i-zmdi-shopping-cart-plus"
        variant="solid"
        color="neutral"
        block
        class="cursor-pointer text-sm sm:text-base mt-2" />
      <UButton
        v-if="whatsApp"
        label="WhatsApp"
        icon="i-logos-whatsapp-icon"
        variant="solid"
        color="neutral"
        block
        class="cursor-pointer text-sm sm:text-base mt-2" />
      <div v-if="lowStock || rating || sold" class="flex justify-between items-center mt-2">
        <UBadge v-if="lowStock" label="Low stock" color="error" variant="soft" class="text-xs" />
        <span v-else />
        <div class="flex items-center gap-1 sm:gap-2 text-muted">
          <span v-if="sold" class="text-xs sm:text-sm">{{ sold }}+ sold </span>
          <template v-if="rating">
            <span v-if="sold">|</span>
            <UIcon name="i-noto-star" class="size-3 sm:size-4" />
            <p class="font-semibold text-xs sm:text-sm">
              {{ rating }}
            </p>
          </template>
        </div>
      </div>
    </div>
  </UCard>
</template>
