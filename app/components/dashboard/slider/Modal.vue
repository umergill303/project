<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import type { Slider, Category, Product } from '~~/server/database/schema'
import { btnColors, layouts, sliderConfig } from '~~/config/slider'
import { defaultSlider } from '~~/default/slider'

const { ui } = useAppConfig()
const emit = defineEmits(['update:isOpen', 'refresh'])
const props = defineProps<
  { isOpen: boolean, modalMode: 'add' | 'upd', defaultValue: Slider | null }>()

const loading = ref(false)
const hasImageError = ref(false)
const showFormFields = ref(false)
const file = ref<File | null>(null)
const filePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const searchQuery = ref('')
const products = ref<Product[]>([])
const selectedProduct = ref<Product | null>(null)

const categories = ref<Category[]>([])
const mapCate = computed(() =>
  [
    { value: null, label: '__No Category__' },
    ...(categories.value ?? [])
      .filter(c => c.id !== undefined && c.name !== undefined)
      .map(c => ({ value: c.id as string | number, label: c.name as string }))
  ])

const { formFields } = sliderConfig(mapCate)
const state = ref<Omit<Slider, 'id'>>({ ...defaultSlider })

watch(() => props.isOpen, async isOpen => {
  if (isOpen) {
    try {
      categories.value = await $fetch<Category[]>('/api/categories')
    }
    catch (error) {
      console.error('Failed to load categories:', error)
    }
  }
})

watch(() => props.defaultValue, async val => {
  if (val) {
    state.value = { ...defaultSlider, ...val }
    filePreview.value = val.image ?? ''
    if (val.product) {
      const { product, thumbnails } = await useProduct(String(val.product))
      selectedProduct.value = product
      if (selectedProduct.value) {
        selectedProduct.value.thumbnail = thumbnails.length ? thumbnails : null
      }
    }
  }
  else {
    state.value = { ...defaultSlider, buttonColor: btnColors[0]?.value || 'neutral' }
    filePreview.value = null
    selectedProduct.value = null
  }
}, { immediate: true })

async function handleFile(fileInput: File | null) {
  if (!fileInput) return
  file.value = fileInput
  filePreview.value = URL.createObjectURL(fileInput)
}

const handleFileChange = (e: Event) =>
  handleFile((e.target as HTMLInputElement).files?.[0] ?? null)

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  handleFile(e.dataTransfer?.files?.[0] || null)
}

const debouncedSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    products.value = []
    return
  }

  loading.value = true
  try {
    const res = await $fetch<{ data: Product[] }>('/api/products', {
      query: { q: searchQuery.value, published: 'true', limit: 10 }
    })
    products.value = res.data || []
  }
  catch { products.value = [] }
  finally { loading.value = false }
}, 300)

function handleSearch() {
  debouncedSearch()
}

function selectProduct(product: Product) {
  selectedProduct.value = product
  searchQuery.value = ''
  products.value = []
}

function removeProduct() { selectedProduct.value = null }

const submit = async () => {
  if (!filePreview.value) {
    hasImageError.value = true
    return
  }
  hasImageError.value = false
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('data', JSON.stringify({ ...state.value, product: selectedProduct.value?.id || null }))
    if (file.value) { formData.append('file', file.value) }

    const isUpd = props.modalMode === 'upd'
    const endPoint = isUpd ? `/api/slider/${props.defaultValue?.id}` : '/api/slider'
    const method = isUpd ? 'PATCH' : 'POST'
    await $fetch(endPoint, { method, body: formData })

    clearAll()
    emit('refresh')
    emit('update:isOpen', false)
    showToast('slideSaved')
  }
  catch (error) { console.error('Submission error:', error) }
  finally { loading.value = false }
}

const clearAll = () => {
  state.value = { ...defaultSlider, buttonColor: btnColors[0]?.value || 'neutral' }
  filePreview.value = null
  selectedProduct.value = null
  searchQuery.value = ''
  hasImageError.value = false
  showFormFields.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const isCloudflare = computed(() =>
  props.modalMode === 'upd' && filePreview.value === props.defaultValue?.image)
</script>

<template>
  <UModal
    :open="isOpen"
    :close="{ color: 'neutral', variant: 'link', class: 'cursor-pointer', onClick: () => { clearAll(), emit('update:isOpen', false) } }"
    :title="modalMode === 'upd'? 'Update slider':'Create New Slider'"
    description="Configure your slider with images and layout options."
    :ui="{ body: 'p-3 sm:p-3 sm:px-5' }">
    <template #body>
      <UForm :state="state" class="space-y-3" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-2 *:w-full">
          <UFormField label="Slider label">
            <UInput v-model="state.label" placeholder="Slider label" class="w-full" />
          </UFormField>
          <UFormField label="Button">
            <UButton label="Add slider buttons" class="cursor-pointer" :icon="showFormFields? 'tabler:x': 'tabler:plus'" block @click="showFormFields = !showFormFields" />
          </UFormField>
          <div v-if="showFormFields" class="grid grid-cols-3 gap-1 col-span-2">
            <UFormField v-for="field in formFields" :key="field.name" :label="field.label">
              <component
                :is="field.component"
                v-model="(state as Record<string, any>)[field.name]"
                :items="field.items"
                :value-key="field.valueKey"
                :placeholder="field.placeholder"
                class="w-full" />
            </UFormField>
          </div>
          <div class="relative col-span-2">
            <UFormField v-if="!selectedProduct" class="w-full" label="Search Products to Associate">
              <UInput
                v-model="searchQuery"
                placeholder="Search products..."
                icon="i-heroicons-magnifying-glass"
                :loading
                class="w-full"
                @input="handleSearch" />
            </UFormField>

            <div v-if="selectedProduct" class="flex items-center gap-2 p-2 mt-2 rounded bg-elevated">
              <div class="flex-shrink-0">
                <NuxtImg :src="selectedProduct.thumbnail || '/Noimage.jpg'" provider="cloudflare" class="size-10 rounded object-cover" />
              </div>
              <div class="min-w-0 truncate font-medium text-sm">
                {{ selectedProduct.name }}
              </div>
              <UButton color="neutral" variant="link" icon="i-heroicons-x-mark" class="ml-auto" @click="removeProduct" />
            </div>

            <div
              v-if="searchQuery && !loading"
              class="absolute z-50 mt-2 w-full bg-elevated rounded shadow max-h-90 overflow-y-auto">
              <div v-if="loading" class="flex justify-center items-center p-2">
                <UIcon name="i-mingcute-loading-line" class="animate-spin size-6" />
              </div>
              <div v-else-if="products.length > 0">
                <div v-for="product in products" :key="product.id" @click="selectProduct(product)">
                  <div class="flex items-center gap-2 m-1 p-2 rounded cursor-pointer hover:bg-(--ui-bg)">
                    <div v-if="product.thumbnail?.length" class="flex-shrink-0">
                      <NuxtImg :src="product.thumbnail ?? '/product/blank.jpg'" provider="cloudflare" class="size-10 rounded object-cover" />
                    </div>
                    <div class="min-w-0 truncate font-medium text-sm">
                      {{ product.name }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-muted font-medium p-10">
                No products found
              </div>
            </div>
          </div>

          <UFormField label="Description" class="col-span-2">
            <UTextarea v-model="state.description" :rows="3" placeholder="Slider description" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Image Upload" :ui="{ label: hasImageError? 'text-error': 'text-default' }">
          <div
            class="relative flex flex-col h-36 cursor-pointer items-center justify-center rounded-md"
            :class="filePreview ? '' : 'border-2 border-dashed border-highlighted/85'"
            @dragover.prevent
            @drop.prevent="handleDrop">
            <input ref="fileInput" type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileChange">
            <NuxtImg v-if="filePreview" :src="filePreview" :provider="isCloudflare? 'cloudflare': undefined" class="w-full h-36 rounded-lg shadow-sm object-cover" alt="Preview" />
            <div v-else class="text-center">
              <UIcon :name="ui.icons.upload" class="size-8 " />
              <div class="mt-2 text-sm font-medium text-center">
                Drag & drop image here
              </div>
              <div class="mt-1 text-xs">
                or click to browse files
              </div>
            </div>
          </div>
        </UFormField>

        <UFormField label="Layout Selection">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="layout in layouts"
              :key="layout.key"
              class="cursor-pointer h-40 overflow-hidden rounded-md border transition-all duration-200"
              :class="[
                state.layout === layout.key
                  ? 'ring-2 ring-primary-500 shadow-md border-primary'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-500/50',
              ]"
              @click="state.layout = layout.key">
              <component :is="layout.component" preview class="h-full w-full" />
            </div>
          </div>
        </UFormField>

        <div class="flex justify-end gap-1 *:cursor-pointer">
          <UButton color="neutral" label="Clear all" variant="outline" icon="i-lucide-eraser" @click="clearAll" />
          <UButton type="submit" :loading label="Save Slider" :icon="ui.icons.add" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
