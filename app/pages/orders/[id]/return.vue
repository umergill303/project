<script setup lang="ts">
import { reactive, watch } from 'vue'
import { z } from 'zod'

const appConfig = useAppConfig()
const toast = useToast()
const route = useRoute()
const id = route.params.id

// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.returnOrdersPageTitle || returnOrdersPage.title, // Fallback title
  description: pageSeoData.value.returnOrdersPageDescription || returnOrdersPage.description, // Fallback description
})

// Fetch order details
const { data: order } = await useFetch(`/api/orders/${id}`)
console.log(order)
const returnSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  country: z.string().min(2, 'Please enter a valid country').max(50),
  city: z.string().min(2, 'Please enter a valid city').max(50),
  street: z.string().min(2, 'Please enter a valid street address').max(100),
  postalCode: z.string().min(3, 'Please enter a valid postal code').max(20),
  reason: z.string().nonempty('Please select a return reason'),
  additionalNotes: z.string().min(10, 'Please provide at least 10 characters of explanation').max(500),
  method: z.string().nonempty('Please select a return method'),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' })
  }),
})

// Form State
const state = reactive({
  name: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  street: '',
  postalCode: '',
  reason: '',
  additionalNotes: '',
  method: '',
  products: order.value?.orderProducts?.map(product => ({
    id: product.id,
    productId: product.productId,
    variantId: product.variantId,
    name: product.name,
    thumbnail: product.thumbnail,
    quantity: product.quantity,
    price: product.finalPrice,
    discount: product.finalDiscount,
    purchasePrice: product.variant?.purchasePrice || product.purchasePrice,
    category: product.category,
    description: product.description,
    shippingCost: product.shippingCost,
    variantAttributes: product.variantAttributes?.map(attr => ({
      attributeId: attr.attributeId,
      attributeName: attr.attributeName,
      attributeType: attr.attributeType,
      optionId: attr.optionId,
      optionName: attr.optionName,
      hint: attr.hint,
      color: attr.color,
      image: attr.image
    })) || [],
    return: false,
    maxReturnQuantity: product.quantity,
    originalQuantity: product.quantity
  })) || [],
  terms: false,
})

// Watch product quantities
watch(() => state.products, newProducts => {
  newProducts.forEach(product => {
    if (product.quantity > product.maxReturnQuantity) {
      product.quantity = product.maxReturnQuantity
    }
    else if (product.quantity < 1) {
      product.quantity = 1
    }
  })
}, { deep: true })

// Submit Handler
const returnOrder = async () => {
  try {
    const productsToReturn = state.products
      .filter(product => product.return)
      .map(product => ({
        id: product.id,
        productId: product.productId,
        variantId: product.variantId,
        quantity: product.quantity,
      }))

    if (productsToReturn.length === 0) {
      throw new Error('No products selected for return')
    }

    const res = await $fetch('/api/orders/return', {
      method: 'POST',
      body: {
        ...state,
        products: productsToReturn,
        order: id
      }
    })

    toast.add({
      title: 'Return request submitted',
      description: 'Your return request has been submitted successfully.',
      color: 'primary',
      icon: 'i-heroicons-check-circle',
    })

    navigateTo('/orders')
  }
  catch (error: any) {
    let errorMessage = 'Failed to submit return request. Please try again.'

    if (error.message.includes('No products selected')) {
      errorMessage = 'Please select at least one product to return.'
    }
    else if (error.status === 400) {
      errorMessage = 'A return request for this order is already submitted.'
    }
    else if (error.data?.message) {
      errorMessage = error.data.message
    }

    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
    })
  }
}

// Helper functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR'
  }).format(value)
}

const getDiscounted = (price: number, discount: number) => {
  return price * (1 - discount / 100)
}

const handleQuantityInput = (product: any) => {
  const newValue = Number(product.quantity) || 1
  product.quantity = Math.min(Math.max(1, newValue), product.maxReturnQuantity)
}

const returnReasons = [
  { value: 'defective', label: 'Defective or Damaged' },
  { value: 'wrong-item', label: 'Wrong Item Received' },
  { value: 'not-as-described', label: 'Not as Described' },
  { value: 'no-longer-needed', label: 'No Longer Needed' },
  { value: 'better-alternative', label: 'Found Better Alternative' },
  { value: 'other', label: 'Other Reason' }
]

const returnMethods = [
  { value: 'pickup', label: 'Schedule a pickup' },
  { value: 'drop-off', label: 'Drop off at return center' },
  { value: 'courier', label: 'Send through courier' },
  { value: 'none', label: 'Other method' }
]
</script>

<template>
  <UMain>
    <UContainer class="py-6 sm:py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Header Section -->
        <div class="text-center space-y-3">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Return Request
          </h1>
          <p class="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Submit a return for Order #{{ id }} with our simple process
          </p>
        </div>
        <AppBreadcrumbs class="mb-6" />

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Products Card -->
          <UCard
            class="shadow-lg hover:shadow-xl h-fit transition-shadow duration-300"
            :ui="{
              base: 'overflow-hidden',
              body: { base: 'p-6' },
              header: { base: 'bg-gray-100 dark:bg-gray-800 px-6 py-4' },
            }">
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Select Items to Return
                </h2>
                <span class="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  {{ state.products.filter(p => p.return).length }} selected
                </span>
              </div>
            </template>

            <div class="space-y-6">
              <div
                v-for="product in state.products"
                :key="product.id"
                class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                <div class="flex items-start space-x-4">
                  <UCheckbox
                    v-model="product.return"
                    :name="`product-${product.id}`"
                    class="mt-2"
                    color="primary"
                    :ui="{ wrapper: 'relative flex items-center' }"
                    aria-label="Select product for return" />

                  <!-- Product Thumbnail -->
                  <div class="flex-shrink-0">
                    <NuxtImg
                      :src="product.thumbnail"
                      :provider="product.thumbnail[0] ? 'cloudflare' : undefined"
                      class="size-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                      :alt="product.name"
                      placeholder="/Noimage.jpg"
                      loading="lazy" />
                  </div>

                  <div class="flex-1 min-w-0 space-y-2">
                    <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {{ product.name }}
                    </h3>

                    <!-- Category -->
                    <p v-if="product.category" class="text-xs text-gray-500 dark:text-gray-400">
                      {{ product.category }}
                    </p>

                    <!-- Update this part in your template -->
                    <div v-if="product.variantAttributes?.length" class="flex flex-wrap items-center gap-2 mt-1">
                      <template v-for="attr in product.variantAttributes" :key="attr.optionId">
                        <div class="flex items-center text-xs">
                          <span v-if="attr.attributeType === 'Color'" class="flex items-center gap-1">
                            <span class="text-gray-600 dark:text-gray-300">{{ attr.attributeName }}:</span>
                            <span
                              v-if="attr.color"
                              class="w-3 h-3 rounded-full mr-1 border border-gray-300"
                              :style="{ backgroundColor: attr.color }" />
                            <span class="text-gray-800 dark:text-gray-100">
                              {{ attr.optionName }}
                            </span>
                          </span>
                          <span v-else-if="attr.attributeType === 'Image'" class="flex items-center gap-1">
                            <span class="text-gray-600 dark:text-gray-300">{{ attr.attributeName }}:</span>
                            <NuxtImg
                              v-if="attr.image"
                              :src="JSON.parse(attr.image)[0]"
                              provider="cloudflare"
                              class="w-7 h-7 rounded-sm object-cover border border-gray-200 dark:border-gray-700"
                              :alt="attr.optionName || attr.attributeName"
                              loading="lazy" />
                          </span>
                          <span v-else class="flex items-center gap-1">
                            <span class="text-gray-600 dark:text-gray-300">{{ attr.attributeName }}:</span>
                            <span class="text-gray-800 dark:text-gray-100">
                              {{ attr.optionName }}
                              <span v-if="attr.hint" class="text-gray-500">({{ attr.hint }})</span>
                            </span>
                          </span>
                        </div>
                      </template>
                    </div>
                    <!-- Price and Discount -->
                    <div class="flex items-center gap-3 mt-2">
                      <p class="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {{ formatCurrency(getDiscounted(product.price, product.discount)) }}
                      </p>
                      <p v-if="product.discount" class="text-sm text-gray-500 dark:text-gray-400 line-through">
                        {{ formatCurrency(product.price) }}
                      </p>
                      <p v-if="product.discount" class="text-xs text-red-600 dark:text-red-400">
                        {{ product.discount }}% off
                      </p>
                    </div>

                    <!-- Quantity Selector -->
                    <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                      <span class="text-sm text-gray-500 dark:text-gray-400">
                        Max: {{ product.maxReturnQuantity }}
                      </span>
                      <div class="flex items-center gap-2">
                        <label :for="`quantity-${product.id}`" class="text-sm text-gray-600 dark:text-gray-300">Qty:</label>
                        <UInput
                          :id="`quantity-${product.id}`"
                          v-model.number="product.quantity"
                          type="number"
                          size="sm"
                          class="w-20"
                          :min="1"
                          :max="product.maxReturnQuantity"
                          :disabled="!product.return"
                          color="primary"
                          aria-label="Return quantity"
                          @input="handleQuantityInput(product)"
                          @blur="product.quantity = Math.min(Math.max(1, product.quantity), product.maxReturnQuantity)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Form Card -->
          <UCard
            class="shadow-lg hover:shadow-xl transition-shadow duration-300"
            :ui="{
              base: 'overflow-hidden',
              body: { base: 'p-6' },
              header: { base: 'bg-gray-100 dark:bg-gray-800 px-6 py-4' },
            }">
            <template #header>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Return Details
              </h2>
            </template>

            <UForm
              :state="state"
              :schema="returnSchema"
              class="space-y-6"
              @submit="returnOrder">
              <!-- Customer Information -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <UIcon name="i-heroicons-user-circle" class="mr-2 text-primary-500" />
                  Your Information
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UFormField label="Full Name" name="name" required>
                    <UInput
                      v-model="state.name"
                      placeholder="Enter your full name"
                      icon="i-heroicons-user"
                      size="md"
                      color="primary"
                      class="transition-all duration-200"
                      aria-required="true" />
                  </UFormField>
                  <UFormField label="Email Address" name="email" required>
                    <UInput
                      v-model="state.email"
                      type="email"
                      placeholder="you@example.com"
                      icon="i-heroicons-envelope"
                      size="md"
                      color="primary"
                      class="transition-all duration-200"
                      aria-required="true" />
                  </UFormField>
                  <UFormField label="Phone Number" name="phone">
                    <UInput
                      v-model="state.phone"
                      placeholder="+92 (___) ___ ____"
                      icon="i-heroicons-phone"
                      size="md"
                      color="primary"
                      class="transition-all duration-200" />
                  </UFormField>
                </div>
              </div>

              <!-- Address Info -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <UIcon name="i-heroicons-map-pin" class="mr-2 text-primary-500" />
                  Return Address
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UFormField label="Country" name="country" required>
                    <UInput
                      v-model="state.country"
                      placeholder="Enter country"
                      icon="i-lucide-globe"
                      size="md"
                      color="primary"
                      class="transition-all duration-200"
                      aria-required="true" />
                  </UFormField>
                  <UFormField label="City" name="city" required>
                    <UInput
                      v-model="state.city"
                      placeholder="Enter city"
                      icon="i-lucide-building-2"
                      size="md"
                      color="primary"
                      class="transition-all duration-200"
                      aria-required="true" />
                  </UFormField>
                  <UFormField label="Street Address" name="street" required>
                    <UInput
                      v-model="state.street"
                      placeholder="Enter street address"
                      :icon="appConfig.ui.icons.street || 'i-heroicons-home'"
                      size="md"
                      color="primary"
                      class="transition-all duration-200"
                      aria-required="true" />
                  </UFormField>
                  <UFormField label="Postal Code" name="postalCode" required>
                    <UInput
                      v-model="state.postalCode"
                      placeholder="Enter postal code"
                      icon="i-lucide-credit-card"
                      size="md"
                      color="primary"
                      class="transition-all duration-200"
                      aria-required="true" />
                  </UFormField>
                </div>
              </div>

              <!-- Return Reason -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <UIcon name="i-heroicons-exclamation-circle" class="mr-2 text-primary-500" />
                  Return Reason
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UFormField label="Reason for Return" name="reason" required>
                    <USelect
                      v-model="state.reason"
                      :items="returnReasons"
                      placeholder="Select a reason"
                      :icon="appConfig.ui.icons.return || 'i-heroicons-arrow-path'"
                      size="md"
                      color="primary"
                      class="transition-all duration-200 w-52"
                      aria-required="true" />
                  </UFormField>
                  <UFormField label="Additional Notes" name="additionalNotes" required>
                    <UTextarea
                      v-model="state.additionalNotes"
                      placeholder="Explain the issue in detail..."
                      icon="i-lucide-notebook-pen"
                      rows="4"
                      size="md"
                      color="primary"
                      class="transition-all duration-200"
                      aria-required="true" />
                  </UFormField>
                </div>
              </div>

              <!-- Return Method -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <UIcon name="i-heroicons-truck" class="mr-2 text-primary-500" />
                  Return Method
                </h3>
                <UFormField name="method" required>
                  <URadioGroup
                    v-model="state.method"
                    :items="returnMethods"
                    color="primary"
                    class="grid grid-cols-1 gap-3"
                    aria-required="true">
                    <template #label="{ item }">
                      <div class="flex items-center">
                        <UIcon
                          :name="item.value === 'pickup' ? 'i-heroicons-calendar'
                            : item.value === 'drop-off' ? 'i-heroicons-building-storefront'
                              : item.value === 'courier' ? 'i-heroicons-envelope'
                                : 'i-heroicons-question-mark-circle'"
                          class="mr-2 text-primary-500" />
                        <span class="text-sm sm:text-base">{{ item.label }}</span>
                      </div>
                    </template>
                  </URadioGroup>
                </UFormField>
              </div>

              <!-- Terms and Submit -->
              <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                <UFormField name="terms" required>
                  <div class="flex items-start">
                    <UCheckbox
                      v-model="state.terms"
                      color="primary" />
                    <label class="ml-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      I agree to the <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">Return Policy</a> and understand that my refund will be processed once the item is inspected.
                    </label>
                  </div>
                </UFormField>
                <div class="mt-4">
                  <UButton
                    type="submit"
                    color="primary"
                    size="md"
                    class="w-full cursor-pointer"
                    :disabled="!state.terms"
                    :ui="{ disabled: 'cursor-not-allowed opacity-50' }">
                    <UIcon name="i-heroicons-paper-airplane" class="mr-2" />
                    Submit Return Request
                  </UButton>
                </div>
              </div>
            </UForm>
          </UCard>
        </div>
      </div>
    </UContainer>
  </UMain>
</template>
