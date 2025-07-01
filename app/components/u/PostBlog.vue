<script lang="ts" setup>
import { computed, ref } from 'vue'
import { NuxtLink } from '#components'

/** Tailwind Variants Utility with Variant Support */
function tv<
  Slots extends Record<string, string>,
  Variants extends Record<string, Partial<Record<keyof Slots, string>>> = Record<string, never>
>(options: { slots: Slots, variants?: Variants }) {
  return (props: {
    class?: Partial<Record<keyof Slots, string>>
    variant?: keyof Variants
  } = {}) => {
    const result = {} as Record<keyof Slots, () => string>
    for (const slot in options.slots) {
      result[slot] = () => {
        const base = options.slots[slot]
        const variant = props.variant && options.variants?.[props.variant]?.[slot]
        const custom = props.class?.[slot]
        return [base, variant, custom].filter(Boolean).join(' ')
      }
    }
    return result
  }
}

type PartialString<T> = {
  [P in keyof T]?: string
}

interface Product {
  name?: string
  price?: number
  discount?: number
  thumbnail?: string
  description?: string
}

interface UiSlots {
  base: string
  thumbnail: string
  wrapper: string
  content: string
  name: string
  description: string
  value: string
  price: string
  discount: string
  footer: string

}

interface Props {
  to?: string
  product?: Product
  name?: string
  price?: number
  discount?: number
  thumbnail?: string
  description?: string
  variant?: 'default' | 'outline' | 'soft' | 'subtle' | 'naked'
  orientation?: 'vertical' | 'horizontal'
  ui?: PartialString<UiSlots> & {
    variants?: {
      horizontal?: PartialString<UiSlots>
      vertical?: PartialString<UiSlots>
    }
  }
  compactLayout?: boolean
  wishLabel?: string // wish
  cartLabel?: string // cart
  hideCart?: boolean // cart
  hideWish?: boolean // wish
  wishActive?: boolean // wish
  wishFloating?: boolean // wish floating
  leadingWishIcon?: string // wish
  leadingCartIcon?: string // cart
  cartSize?: 'xs' | 'sm' | 'md' | 'lg' // cart
  wishSize?: 'xs' | 'sm' | 'md' | 'lg' // wish
  cartVariant?: 'outline' | 'subtle' | 'link' | 'solid' | 'soft' | 'ghost' // cart
  wishVariant?: 'outline' | 'subtle' | 'link' | 'solid' | 'soft' | 'ghost' // wish
  cartColor?: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral' // cart
  wishColor?: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral' // wish
  onCart?: (event: MouseEvent) => void // cart
  onWish?: (event: MouseEvent) => void // wish
}

const props = defineProps<Props>()

const name = computed(() => props.name ?? props.product?.name ?? '')
const price = computed(() => props.price ?? props.product?.price ?? 0)
const discount = computed(() => props.discount ?? props.product?.discount ?? 0)
const thumbnail = computed(() => props.thumbnail ?? props.product?.thumbnail ?? '')
const description = computed(() => props.description ?? props.product?.description ?? '')

const isWished = ref(props.wishActive ?? false)
watch(() => props.wishActive, newVal => {
  if (newVal !== undefined) isWished.value = newVal
})
function handleWish(event: MouseEvent) {
  isWished.value = !isWished.value
  props.onWish?.(event)
}

const _slots = defineSlots<{
  content?: () => VNode
  value?: () => VNode
  default?: () => VNode
  footer?: () => VNode
}>()

const card = tv({
  slots: {
    base: 'relative flex flex-col w-full max-w-70 gap-2.5 rounded-lg transition-all overflow-hidden',
    thumbnail: 'aspect-square max-h-50 max-w-70 overflow-hidden',
    wrapper: 'flex flex-col justify-center pb-2',
    content: 'px-3',
    name: 'text-sm sm:text-md text-highlighted/90 tracking-tight text-pretty font-medium line-clamp-1',
    description: 'text-base text-muted text-pretty line-clamp-2',
    //
    value: 'flex items-center font-medium text-sm sm:text-md md:text-lg gap-3 px-3',
    price: 'text-default',
    discount: 'line-through text-error',
    //
    footer: 'flex flex-grow gap-1 px-3 pt-1',

  },
  variants: {
    default: {
      base: 'border border-default bg-(--ui-bg)',
    },
    outline: {
      base: 'border border-default bg-transparent',
    },
    subtle: {
      base: 'ring ring-(--ui-border) bg-elevated/50',
    },
    soft: {
      base: 'bg-elevated/50',
    },
    naked: {
      base: 'bg-transparent rounded-none',
    },
    horizontal: {
      base: 'flex w-full flex-row max-w-130 gap-2.5 rounded-lg',
      thumbnail: 'aspect-square',
      wrapper: 'py-2',
      description: '',
      footer: ''
    }
  },
})
const ui = computed(() => {
  const orientation = props.orientation || 'vertical'
  const mergedClass = { ...(props.ui || {}) }

  const variantClass = card({ class: mergedClass, variant: props.variant || 'default' })
  const orientationClass = card({ variant: orientation })
  const orientationOverrides = props.ui?.variants?.[orientation] || {}

  const compactMap: Record<string, string> = {
    base: 'items-center',
    thumbnail: 'max-w-30',
    wrapper: 'flex flex-row w-full items-center justify-between',
    content: '*:text-sm *:sm:text-sm8 basis-3/2',
    value: 'basis-3/4 justify-between *:text-sm',
    footer: 'basis-2/4'
  }

  for (const key in variantClass) {
    const typedKey = key as keyof typeof variantClass
    const v = variantClass[typedKey]?.() || ''
    const o = orientationClass[typedKey]?.() || ''
    const u = orientationOverrides[typedKey] || ''
    const compact = props.compactLayout && orientation === 'horizontal' ? compactMap[typedKey] || '' : ''

    variantClass[typedKey] = () => [v, o, u, compact].filter(Boolean).join(' ')
  }

  return variantClass
})

const discountedPrice = computed(() => {
  return discount.value > 0
    ? +((price.value ?? 0) * (1 - discount.value / 100)).toFixed(2)
    : (price.value ?? 0)
})

const isLink = computed(() => !!props.to)
const actionSize = computed(() => props.cartSize || 'md')
</script>

<template>
  <component
    :is="isLink ? NuxtLink : 'div'"
    :to="to"
    :class="ui.base()">
    <!-- Thumbnail -->
    <div :class="ui.thumbnail()">
      <img :src="thumbnail" :alt="name" class="object-cover object-center w-full h-full">
    </div>
    <!-- Thumbnail -->

    <!-- Wish (Top Right) -->
    <div v-if="!props.hideWish && props.wishFloating" class="absolute top-2 right-2 z-10">
      <UButton
        :color="wishColor"
        :variant="wishVariant"
        :icon="isWished ? 'tabler-heart-filled' : (leadingWishIcon || 'tabler-heart')"
        class="cursor-pointer"
        @click.stop="handleWish" />
    </div>
    <!-- /Wish -->

    <!-- Wrapper -->
    <div :class="ui.wrapper()">
      <!-- Content -->
      <div :class="ui.content()">
        <slot name="content">
          <p :class="ui.name()">
            {{ name }}
          </p>
          <p :class="ui.description()">
            {{ description }}
          </p>
        </slot>
      </div>
      <!-- Content -->

      <!-- Value -->
      <div :class="ui.value()">
        <slot name="value">
          <span v-if="price" :class="ui.price()">${{ discountedPrice.toFixed(2) }}</span>
          <span v-if="discount" :class="ui.discount()">${{ price.toFixed(2) }}</span>
        </slot>
      </div>
      <!-- Value -->

      <!-- Default -->
      <slot />
      <!-- Default -->

      <!-- Cart -->
      <div v-if="!props.hideCart || !props.hideWish" :class="ui.footer()">
        <slot name="footer">
          <UButton
            v-if="!props.hideCart"
            :label="cartLabel || 'Add to cart'"
            :size="actionSize"
            :color="cartColor"
            :variant="cartVariant"
            class="flex justify-center w-full cursor-pointer"
            :class="ui"
            @click="onCart">
            <template #leading>
              <Icon :name="leadingCartIcon || 'i-dashicons-cart'" class="size-4" />
            </template>
          </UButton>
          <UButton
            v-if="!props.hideWish && !props.wishFloating"
            :color="wishColor"
            :variant="wishVariant"
            class="cursor-pointer"
            :label="!props.wishLabel? '': props.wishLabel"
            :class="props.hideCart? 'w-full justify-center': ''"
            :icon="isWished ? 'tabler-heart-filled' : (leadingWishIcon || 'tabler-heart')"
            @click="handleWish" />
        </slot>
      </div>
      <!-- Cart -->
    </div>
    <!-- Wrapper -->
  </component>
</template>
