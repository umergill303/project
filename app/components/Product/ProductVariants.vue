<script lang="ts" setup>
const props = defineProps<{
  productId: string
  features: { productVariants: boolean }
  colorOptions: VariantOption[]
  sizeOptions: VariantOption[]
  combOptions: CombinationOption[]
  initialSelectedSize?: string | null
  initialSelectedColor?: string | null
  initialSelectedCombination?: string | null
  variantError?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selectedSize', value: string | null): void
  (e: 'update:selectedColor', value: string | null): void
  (e: 'update:selectedCombination', value: string | null): void
  (e: 'update:variantError', value: boolean): void
}>()

const selectedSize = ref<string | null>(props.initialSelectedSize ?? null)
const selectedColor = ref<string | null>(props.initialSelectedColor ?? null)
const selectedCombination = ref<string | null>(props.initialSelectedCombination ?? null)
const open = ref(false)
const localVariantError = ref(props.variantError ?? false)

const hasColorVariants = computed(() => props.colorOptions.length > 0)
const hasSizeVariants = computed(() => props.sizeOptions.length > 0)
const hasCombinations = computed(() => props.combOptions.length > 0)

const getVariantStock = (variant: any) => variant.stock || 0
const isVariantOutOfStock = (variant: any) => getVariantStock(variant) <= 0

watch(() => props.variantError, newVal => {
  localVariantError.value = newVal ?? false
})

watch(localVariantError, newVal => {
  emit('update:variantError', newVal)
})

const getSelectedVariantName = computed(() => {
  if (selectedCombination.value) {
    const comb = props.combOptions.find(c => c.id === selectedCombination.value)
    return comb ? `${comb.size} ${comb.colorName || ''}` : ''
  }

  let name = ''
  if (selectedColor.value) {
    const color = props.colorOptions.find(c => c.name === selectedColor.value)
    name += color?.name || ''
  }
  if (selectedSize.value) {
    if (name) name += ' / '
    name += selectedSize.value
  }
  return name
})

const currentVariantStock = computed(() => {
  if (selectedCombination.value) {
    const matchedComb = props.combOptions.find(c => c.id === selectedCombination.value)
    return matchedComb?.stock || 0
  }

  if (selectedSize.value && selectedColor.value) {
    const matchedVariant = props.combOptions.find(v =>
      v.size === selectedSize.value && v.color === selectedColor.value
    )
    if (matchedVariant) {
      return matchedVariant.stock || 0
    }
  }

  if (selectedSize.value) {
    const sizeVariant = props.sizeOptions.find(s => s.name === selectedSize.value)
    if (sizeVariant) {
      return sizeVariant.stock || 0
    }
  }

  if (selectedColor.value) {
    const colorVariant = props.colorOptions.find(c => c.name === selectedColor.value)
    if (colorVariant) {
      return colorVariant.stock || 0
    }
  }

  return 0
})

const clearSelections = () => {
  selectedSize.value = null
  selectedColor.value = null
  selectedCombination.value = null
  localVariantError.value = false
  emit('update:selectedSize', null)
  emit('update:selectedColor', null)
  emit('update:selectedCombination', null)
}

watch([selectedSize, selectedColor, selectedCombination], ([newSize, newColor, newComb], [oldSize, oldColor, oldComb]) => {
  if (newSize || newColor || newComb) {
    localVariantError.value = false
  }

  if (newComb && newComb !== oldComb) {
    const comb = props.combOptions.find(c => c.id === newComb)
    if (comb) {
      if (selectedSize.value !== comb.size) selectedSize.value = comb.size
      if (selectedColor.value !== comb.color) selectedColor.value = comb.color
    }
    return
  }

  if (newComb === null && oldComb !== null) {
    // Clear size/color only if they were set by the combination
    const oldCombData = props.combOptions.find(c => c.id === oldComb)
    if (oldCombData && selectedSize.value === oldCombData.size) {
      selectedSize.value = null
    }
    if (oldCombData && selectedColor.value === oldCombData.color) {
      selectedColor.value = null
    }
    return
  }

  if ((newSize !== oldSize || newColor !== oldColor) && !newComb) {
    if (newSize && newColor) {
      const matchingComb = props.combOptions.find(c =>
        c.size === newSize && c.color === newColor
      )
      if (matchingComb) {
        selectedCombination.value = matchingComb.id
      }
      else {
        selectedCombination.value = null
      }
    }
    else {
      selectedCombination.value = null
    }
  }

  emit('update:selectedSize', newSize)
  emit('update:selectedColor', newColor)
  emit('update:selectedCombination', selectedCombination.value)
}, { deep: true })
</script>

<template>
  <div>
    <!-- Color Variants -->
    <div v-if="features.productVariants && hasColorVariants" class="space-y-1">
      <h3 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        Color
      </h3>
      <div class="w-75 flex flex-wrap gap-2 p-1 md:p-2">
        <UTooltip
          v-for="(color, idx) in colorOptions"
          :key="idx"
          :text="isVariantOutOfStock(color) ? 'Out of Stock' : color.name">
          <button
            class="w-8 h-8 rounded-full border-2 hover:border-primary-500 transition-all flex items-center justify-center relative"
            :class="[
              selectedColor === color.name ? 'border-2 border-primary-500' : 'border-2 border-neutral-20',
              isVariantOutOfStock(color) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
            ]"
            :style="{ backgroundColor: color.color }"
            :disabled="isVariantOutOfStock(color)"
            :title="color.name"
            @click="!isVariantOutOfStock(color) && (selectedColor = color.name === selectedColor ? null : color.name, localVariantError = false)">
            <span
              v-if="isVariantOutOfStock(color)"
              class="absolute w-[95%] h-px bg-neutral-200 rotate-45 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </button>
        </UTooltip>
      </div>
    </div>

    <!-- Size Variants -->
    <div v-if="features.productVariants && hasSizeVariants" class="space-y-2">
      <h3 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        Size
      </h3>
      <div class="flex flex-wrap gap-2 space-y-2">
        <UTooltip
          v-for="(size, idx) in sizeOptions"
          :key="idx"
          :text="isVariantOutOfStock(size) ? 'Out of Stock' : size.name">
          <button
            class="px-4 py-1 text-sm border-2 border-neutral-600 rounded-full transition-all hover:border-primary-500 flex items-center justify-center min-w-[40px] relative"
            :class="[
              selectedSize === size.name ? 'border-primary-500 text-primary-500 dark:text-primary-400 font-medium' : 'border-gray-300 text-gray-700 dark:text-gray-300',
              isVariantOutOfStock(size) ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer',
            ]"
            :disabled="isVariantOutOfStock(size)"
            @click="!isVariantOutOfStock(size) && (selectedSize = size.name === selectedSize ? null : size.name, localVariantError = false)">
            <span>{{ size.name }}</span>
            <span
              v-if="isVariantOutOfStock(size)"
              class="absolute w-[80%] h-px bg-neutral-500 rotate-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </button>
        </UTooltip>
      </div>
    </div>

    <!-- Combination Variants -->
    <div v-if="features.productVariants && hasCombinations" class="space-y-2">
      <h3 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        Options:
      </h3>
      <UButton
        label="Select Variant"
        icon="i-heroicons-swatch"
        color="neutral"
        variant="outline"
        @click="open = true" />
      <UModal
        v-model:open="open"
        :overlay="false"
        variant="link"
        title="Variants"
        description="Select Variants"
        :ui="{ footer: 'justify-end' }">
        <template #body>
          <div v-if="features.productVariants && hasCombinations" class="mb-4">
            <h3 class="text-lg font-semibold mb-2">
              Options
            </h3>
            <div class="flex flex-wrap gap-2">
              <UTooltip
                v-for="(comb, idx) in combOptions"
                :key="idx"
                :text="isVariantOutOfStock(comb) ? 'Out of Stock' : `${comb.size} ${comb.color || ''}`">
                <button
                  class="px-4 py-1 text-sm border-2 border-neutral-600 rounded-full hover:border-primary-400 transition-all flex items-center gap-2 relative"
                  :class="[
                    selectedCombination === comb.id ? 'border-primary-500 text-primary-400 dark:text-primary-400 font-medium' : 'border-gray-300 text-gray-700 dark:text-gray-300',
                    isVariantOutOfStock(comb) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                    localVariantError && selectedCombination === comb.id ? 'border-red-500' : '',
                  ]"
                  :disabled="isVariantOutOfStock(comb)"
                  @click="!isVariantOutOfStock(comb) && (selectedCombination = comb.id === selectedCombination ? null : comb.id, localVariantError = false)">
                  <span
                    v-if="comb.color"
                    class="w-4 h-4 rounded-xl border border-neutral-200 inline-block"
                    :style="{ backgroundColor: comb.color }" />
                  <span>{{ comb.size }} {{ comb.colorName || '' }}</span>
                  <span
                    v-if="isVariantOutOfStock(comb)"
                    class="absolute w-[75%] h-px bg-neutral-300 rotate-27 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                </button>
              </UTooltip>
            </div>
          </div>
        </template>
        <template #footer>
          <UButton label="Close" color="neutral" variant="outline" @click="open = false" />
        </template>
      </UModal>
    </div>

    <!-- Selected Variant Display -->
    <div
      v-if="(selectedCombination || selectedColor || selectedSize)
        && !(selectedCombination === null && selectedColor === null && selectedSize === null)"
      class="text-sm flex items-center gap-2">
      <div class="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-sm">
        <span class="font-medium text-gray-700 dark:text-gray-300">Selected:</span>
        <template v-if="selectedCombination">
          <span class="flex items-center gap-1">
            <span
              v-if="combOptions.find(c => c.id === selectedCombination)?.color"
              class="w-3 h-3 rounded-full border border-gray-200 inline-block"
              :style="{ backgroundColor: combOptions.find(c => c.id === selectedCombination)?.color }" />
            {{ getSelectedVariantName }}
          </span>
        </template>
        <template v-else>
          <span v-if="selectedColor" class="flex items-center gap-1">
            <span
              v-if="colorOptions.find(c => c.name === selectedColor)?.color"
              class="w-3 h-3 rounded-full border border-gray-200 inline-block"
              :style="{ backgroundColor: colorOptions.find(c => c.name === selectedColor)?.color }" />
            {{ colorOptions.find(c => c.name === selectedColor)?.name }}
          </span>
          <span v-if="selectedSize && selectedColor" class="text-gray-400">/</span>
          <span v-if="selectedSize">
            {{ selectedSize }}
          </span>
        </template>
        <span v-if="currentVariantStock > 0" class="text-green-600 dark:text-green-400">
          ({{ currentVariantStock }} available)
        </span>
        <span v-else class="text-red-600 dark:text-red-400">
          (Out of Stock)
        </span>
      </div>
      <UButton
        icon="i-heroicons-x-mark"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="clearSelections" />
    </div>

    <!-- Variant Error Message -->
    <div
      v-if="localVariantError"
      class="w-75 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-sm">
      Please select a variant before adding to cart
    </div>
  </div>
</template>
