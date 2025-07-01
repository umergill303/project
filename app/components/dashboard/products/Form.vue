<script lang="ts" setup>
import { UCheckbox } from '#components'
import { defaultProduct } from '~~/default/product'
import { getProductFields } from '~~/config/product'
import { formatCurrency } from '~/utils/formatCurrency'
import type { Product } from '~~/server/database/schema'
import { productSchema } from '~~/schema/product.schema'

interface Image { file?: File, filePreview: string }

const router = useRouter()
const loading = ref(false)
const { ui } = useAppConfig()
const props = defineProps({
  mode: { type: String as () => 'add' | 'upd', default: 'add' },
  productId: { type: String, default: '' }
})

const images = ref<Image[]>([])
const hasImagesError = ref(false)
const hasImageSquareError = ref(false)

const videoFile = ref<File | null>(null)
const videoPreview = ref<string | null>(null)

const file = ref<File | null>(null)
const filePreview = ref<string | null>(null)

const brandWrtDurationUnit = ref<string>('Month')
const brandWrtDurationNumber = ref<number | null>(null)
const brandWarrantyDuration = computed(() => {
  if (brandWrtDurationNumber.value && brandWrtDurationUnit.value) {
    return `${brandWrtDurationNumber.value} ${brandWrtDurationUnit.value}`
  }
  return ''
})

const sellerWrtDurationUnit = ref<string>('Month')
const sellerWrtDurationNumber = ref<number | null>(null)
const sellerWarrantyDuration = computed(() => {
  if (sellerWrtDurationNumber.value && sellerWrtDurationUnit.value) {
    return `${sellerWrtDurationNumber.value} ${sellerWrtDurationUnit.value}`
  }
  return ''
})

const deliveryDurationUnit = ref<string>('Days')
const deliveryDurationNumber = ref<number | null>(null)
const deliveryDuration = computed(() => {
  if (deliveryDurationNumber.value && deliveryDurationUnit.value) {
    return `${deliveryDurationNumber.value} ${deliveryDurationUnit.value}`
  }
  return ''
})

const product = ref<Omit<Product, 'id'>>({ ...defaultProduct })

const { tagData, brandData, cateData, fetchTags, fetchBrands, fetchCategories } = useClassification()
await Promise.all([fetchTags(), fetchBrands(), fetchCategories()])

const { features } = useRuntimeConfig().public.ecommerce
const { productFields, featured, seoColumn } = getProductFields(tagData, brandData, cateData, features)
const { product: productData, tags, seoTags, thumbnails: productThumbnails } = await useProduct(props.productId)

if (props.mode === 'upd' && productData) {
  product.value = {
    ...productData,
    season: productData.season,
    tags: tags.map(tag => tag.id),
    seoTags: seoTags.map(tag => tag.id),
    brand: productData.brand?.id ?? null,
    featured: Boolean(productData.featured),
    hVariants: Boolean(productData.hVariants),
    category: productData.category?.id ?? null,
    freeShipping: Boolean(productData.freeShipping),
    brandWarranty: Boolean(productData.brandWarranty),
    sellerWarranty: Boolean(productData.sellerWarranty),
  }
  if (productData.brandWrtDuration) {
    const parts = productData.brandWrtDuration.split(' ')
    if (parts.length === 2) {
      brandWrtDurationNumber.value = parseInt(parts[0] ?? '') || null
      brandWrtDurationUnit.value = parts[1] || 'Month'
    }
  }
  if (productData.sellerWrtDuration) {
    const parts = productData.sellerWrtDuration.split(' ')
    if (parts.length === 2) {
      sellerWrtDurationNumber.value = parseInt(parts[0] ?? '') || null
      sellerWrtDurationUnit.value = parts[1] || 'Month'
    }
  }
  if (productData.estimatedDelivery) {
    const parts = productData.estimatedDelivery.split(' ')
    if (parts.length === 2) {
      deliveryDurationNumber.value = parseInt(parts[0] ?? '') || null
      deliveryDurationUnit.value = parts[1] || 'Days'
    }
  }
  filePreview.value = productData.ogImg
  images.value = productThumbnails.map((img: string) => ({ filePreview: img }))
  videoPreview.value = productData.video ? `/product-videos/${productData.video}` : null
}
else {
  product.value = { ...defaultProduct }
}

watch([brandWrtDurationNumber, brandWrtDurationUnit], ([num, unit]) => {
  if (num && unit) {
    product.value.brandWrtDuration = `${num} ${unit}`
  }
  else {
    product.value.brandWrtDuration = ''
  }
})

watch([sellerWrtDurationNumber, sellerWrtDurationUnit], ([num, unit]) => {
  if (num && unit) {
    product.value.sellerWrtDuration = `${num} ${unit}`
  }
  else {
    product.value.sellerWrtDuration = ''
  }
})

watch([deliveryDurationNumber, deliveryDurationUnit], ([num, unit]) => {
  if (num && unit) {
    product.value.estimatedDelivery = `${num} ${unit}`
  }
  else {
    product.value.estimatedDelivery = ''
  }
})

const isCloudflare = computed(() => {
  return props.mode === 'upd' && filePreview.value === productData?.ogImg
})

function handleSeoFile(fileInput: File | undefined) {
  if (!fileInput) return
  file.value = fileInput
  filePreview.value = URL.createObjectURL(fileInput)
}

function handleVideoFile(fileInput: File | undefined) {
  if (!fileInput) return

  const validTypes = ['video/mp4', 'video/webm', 'video/ogg']
  if (!validTypes.includes(fileInput.type)) {
    showToast('error', 'Invalid video format. Please upload MP4, WebM, or Ogg files.')
    return
  }

  const maxSize = 32 * 1024 * 1024
  if (fileInput.size > maxSize) {
    showToast('productVideo')
    return
  }
  videoFile.value = fileInput
  videoPreview.value = URL.createObjectURL(fileInput)
  product.value.video = fileInput.name
}

const handleFileEvent = (event: Event | DragEvent, type: 'seo' | 'video' | 'image' = 'image') => {
  const files = event instanceof DragEvent
    ? event.dataTransfer?.files
    : (event.target as HTMLInputElement).files
  if (!files || !files.length) return

  switch (type) {
    case 'seo':
      handleSeoFile(files[0])
      break
    case 'video':
      handleVideoFile(files[0])
      break
    default:
      handleFiles(files)
  }
}

function isSquareImage(file: File): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      resolve(img.width === img.height)
    }
  })
}

async function handleFiles(files: FileList) {
  for (const file of Array.from(files)) {
    if (file.type.startsWith('image/')) {
      const isSquare = await isSquareImage(file)
      if (!isSquare) {
        hasImagesError.value = false
        hasImageSquareError.value = true
        continue
      }
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          images.value.push({ file, filePreview: e.target.result })
          hasImagesError.value = false
          hasImageSquareError.value = false
        }
      }
      reader.readAsDataURL(file)
    }
  }
}

function removeImage(idx: number) {
  images.value.splice(idx, 1)
  if (props.mode === 'upd') {
    product.value.thumbnail = JSON.stringify(images.value.map(img => img.filePreview))
  }
  if (images.value.length === 0) {
    hasImagesError.value = true
  }
}

const submitForm = async () => {
  loading.value = true
  try {
    if (images.value.length === 0) {
      hasImagesError.value = true
      return
    }

    const formData = new FormData()
    if (props.mode === 'upd') {
      const thumbnails = images.value.map(file => file.filePreview)
        .filter(preview => preview && typeof preview === 'string' && !preview.startsWith('data:image'))
        .map(preview => preview.replace(/^.*\/_hub\/blob\//, ''))
      const productData = {
        ...product.value,
        thumbnail: JSON.stringify(thumbnails),
        featured: product.value.featured ? 1 : 0,
        hVariants: product.value.hVariants ? 1 : 0,
        brandWarranty: product.value.brandWarranty ? 1 : 0,
        sellerWarranty: product.value.sellerWarranty ? 1 : 0,
        freeShipping: product.value.freeShipping ? 1 : 0,
        video: videoFile.value ? videoFile.value.name : null,
        brandWrtDuration: brandWarrantyDuration.value,
        sellerWrtDuration: sellerWarrantyDuration.value,
        estimatedDelivery: deliveryDuration.value,
        shippingCost: product.value.freeShipping ? null : product.value.shippingCost
      }
      formData.append('data', JSON.stringify(productData))
    }
    else {
      const productData = {
        ...product.value,
        video: videoFile.value ? videoFile.value.name : null
      }
      formData.append('data', JSON.stringify(productData))
    }

    if (videoFile.value) { formData.append('videoFile', videoFile.value) }

    if (file.value) { formData.append('ogFile', file.value) }
    images.value.forEach(image => { if (image.file) formData.append('files', image.file) })

    const url = props.mode === 'upd' ? `/api/products/${props.productId}` : '/api/products'
    const method = props.mode === 'upd' ? 'PATCH' : 'POST'
    await $fetch(url, { method, body: formData })

    clearAll()
    router.back()
    showToast(props.mode === 'upd' ? 'productUpdated' : 'productAdded')
  }
  catch { showToast('error') }
  finally { loading.value = false }
}

const clearAll = () => {
  images.value = []
  file.value = null
  videoFile.value = null
  videoPreview.value = null

  // Clear main product data
  product.value = { ...defaultProduct }

  // Clear error states
  hasImagesError.value = false
  hasImageSquareError.value = false

  // Clear warranty duration fields
  brandWrtDurationNumber.value = null
  brandWrtDurationUnit.value = 'Month'
  sellerWrtDurationNumber.value = null
  sellerWrtDurationUnit.value = 'Month'

  // Clear delivery duration fields
  deliveryDurationNumber.value = null
  deliveryDurationUnit.value = 'Days'
}

// Publish handler
const publishLoading = ref(false)
const publish = async () => {
  publishLoading.value = true
  try {
    const idsToPublish = [props.productId]
    await $fetch('/api/products/publish', { method: 'PATCH', body: { ids: idsToPublish } })
    showToast('productPublished')
    router.back()
  }
  catch { showToast('error') }
  finally { publishLoading.value = false }
}
</script>

<template>
  <UForm :state="product" :schema="productSchema" @submit="submitForm">
    <section class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-2">
        <section v-for="(obj, idx) in productFields" :key="idx">
          <p class="font-medium p-1">
            {{ obj.title }}
          </p>
          <UPageCard variant="soft" :ui="{ root: 'rounded shadow-sm', container: 'p-3 sm:p-4' }">
            <template #default>
              <div :class="obj.grid">
                <UFormField
                  v-for="field in obj.fields"
                  :key="field.name"
                  :name="field.name"
                  :label="field.label"
                  :required="field.required"
                  :class="field.class">
                  <template v-if="['purchasePrice', 'salePrice', 'discount', 'shippingCost'].includes(field.name?? '')">
                    <UButtonGroup class="w-full">
                      <UButton color="neutral" variant="subtle" :label="field.name === 'discount'? '%' : useRuntimeConfig().public.ecommerce.currency?? ''" class="px-3" />
                      <component
                        :is="field.component"
                        v-model="(product as Record<string, any>)[field.name?? '']"
                        :type="field.type"
                        variant="subtle"
                        :placeholder="formatCurrency((product as Record<string, any>)[field.name ?? ''])"
                        :class="['w-full ', field.class]" />
                    </UButtonGroup>
                  </template>
                  <template v-else-if="field.name === 'estimatedDelivery'">
                    <UFormField label="Estimated Delivery" class="w-full col-span-full">
                      <div class="flex gap-2 *:w-full">
                        <UInput v-model="deliveryDurationNumber" type="number" placeholder="e.g. 1" min="1" variant="subtle" />
                        <USelect v-model="deliveryDurationUnit" :items="['Month', 'Days']" variant="subtle" />
                      </div>
                    </UFormField>
                  </template>

                  <template v-else>
                    <component
                      :is="field.component"
                      v-model="(product as Record<string, any>)[field.name?? '']"
                      :type="field.type"
                      variant="subtle"
                      :items="field.options"
                      :multiple="field.multiple"
                      :value-key="field.valueKey"
                      :placeholder="field.placeholder"
                      :class="['w-full', field.class]" />
                  </template>
                </UFormField>
              </div>
            </template>
          </UPageCard>
        </section>

        <!-- <DashboardProductsVariantModal v-if="productId" :product-id /> -->
      </div>

      <div class="space-y-2">
        <section v-for="(obj, idx) in featured" :key="idx">
          <p class="font-medium p-1">
            {{ obj.title }}
          </p>
          <UPageCard variant="soft" :ui="{ root: 'rounded shadow-sm', container: 'p-3 sm:p-4' }">
            <template #default>
              <div class="space-y-3">
                <UFormField
                  v-for="field in obj.fields"
                  :key="field.name"
                  :name="field.name"
                  :label="field.label"
                  :required="field.required">
                  <UCheckbox
                    v-model="(product as Record<string, any>)[field.name ?? '']"
                    :label="field.description"
                    :ui="{ label: 'text-muted' }" />
                </UFormField>

                <UFormField v-if="!product.freeShipping" label="Shipping Cost" class="w-full">
                  <UButtonGroup class="w-full">
                    <UButton color="neutral" variant="subtle" label="%" class="px-3" />
                    <UInput v-model="(product as Record<string, any>).shippingCost" class="w-full" type="number" variant="subtle" />
                  </UButtonGroup>
                </UFormField>
                <UFormField v-if="product.brandWarranty" label="Brand Warranty Duration" class="w-full">
                  <div class="flex gap-2 *:w-full">
                    <UInput v-model="brandWrtDurationNumber" type="number" placeholder="e.g. 1" min="1" variant="subtle" />
                    <USelect v-model="brandWrtDurationUnit" :items="['Year', 'Month', 'Day']" variant="subtle" />
                  </div>
                </UFormField>
                <UFormField v-if="product.sellerWarranty" label="Seller Warranty Duration" class="w-full">
                  <div class="flex gap-2 *:w-full">
                    <UInput v-model="sellerWrtDurationNumber" type="number" placeholder="e.g. 1" min="1" variant="subtle" />
                    <USelect v-model="sellerWrtDurationUnit" :items="['Year', 'Month', 'Day']" variant="subtle" />
                  </div>
                </UFormField>
              </div>
            </template>
          </UPageCard>
        </section>

        <section v-for="(obj, index) in seoColumn" :key="index" class="space-y-1">
          <p class="px-2 font-semibold">
            {{ obj.title }}
          </p>
          <UPageCard variant="soft" :ui="{ root: 'rounded shadow-sm', container: 'p-4 sm:p-4' }">
            <template #default>
              <div class="grid grid-cols-3 gap-x-3 gap-y-1">
                <div class="col-span-2 space-y-4">
                  <UFormField
                    v-for="field in obj.fields"
                    :key="field.name"
                    :name="field.name"
                    :label="field.label"
                    :class="['w-full', field.class]"
                    :required="field.required">
                    <component
                      :is="field.component"
                      v-model="(product as Record<string, any>)[field.name?? '']"
                      :type="field.type"
                      :class="['w-full', field.class]"
                      variant="subtle"
                      :row="field.rows"
                      multiple
                      :items="field.options"
                      :placeholder="field.placeholder"
                      :value-key="field.valueKey" />
                  </UFormField>
                </div>
                <UFormField label="OG Image">
                  <div
                    class="relative flex flex-col aspect-4/3 cursor-pointer items-center justify-center rounded-md"
                    :class="filePreview ? '' : 'border-2 border-dashed border-highlighted/85'"
                    @dragover.prevent
                    @drop="handleFileEvent($event, 'seo')">
                    <input
                      type="file"
                      accept="image/*"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      @change="handleFileEvent($event, 'seo')">
                    <NuxtImg v-if="filePreview" :src="filePreview" :provider="isCloudflare ? 'cloudflare' : undefined" class="w-full aspect-4/3 rounded-lg shadow-sm object-cover" alt="Preview" />
                    <div v-else class="text-center">
                      <UIcon :name="ui.icons.upload" class="size-6" />
                      <div class="mt-0.5 text-sm font-medium text-center">
                        Drag & drop
                      </div>
                      <div class="mt-1 text-xs">
                        or click
                      </div>
                    </div>
                  </div>
                </UFormField>
                <UFormField label="Seo Description" class="col-span-full">
                  <UTextarea v-model="product.seoDescription" variant="subtle" placeholder="SEO Description" :rows="3" class="w-full" />
                </UFormField>
              </div>
            </template>
          </UPageCard>
        </section>

        <section class="space-y-2">
          <p class="px-2 font-semibold">
            Product Images
          </p>

          <UPageCard
            variant="soft"
            :ui="{ root: '@container rounded shadow-sm', container: 'p-4 sm:p-4', description: 'text-sm font-medium -mb-2' }">
            <template #description>
              <span v-if="hasImagesError" class="text-error">
                At least one image is required.
              </span>
              <span v-else-if="hasImageSquareError" class="text-error">
                Image must be square (1:1 aspect ratio)
              </span>
              <span v-else>
                Upload product thumbnail (square image recommended).
              </span>
            </template>

            <template #default>
              <div class="grid grid-cols-2 @sm:grid-cols-2 @md:grid-cols-3 gap-2">
                <div
                  class="relative flex flex-col items-center justify-center rounded border-2 border-dashed border-highlighted/70 text-center w-full px-4"
                  :class="{ 'col-span-full py-9': !images.length, '@col-span-2 @md:col-span-2': images.length }"
                  @dragover.prevent
                  @drop.prevent="handleFileEvent">
                  <UIcon :name="ui.icons.upload" class="size-7" />
                  <div class="text-sm font-medium">
                    Click to Upload or drag & drop
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    class="absolute inset-0 size-full cursor-pointer opacity-0"
                    @change="handleFileEvent">
                </div>
                <template v-if="images.length">
                  <div v-for="(image, idx) in images" :key="idx" class="relative aspect-square w-full overflow-hidden rounded-lg">
                    <NuxtImg :src="image.filePreview" provider="cloudflare" class="w-full h-full object-cover bg-(--ui-border-accented)" />
                    <UButton color="error" variant="ghost" :icon="ui.icons.xFilled" class="absolute top-0 right-0 cursor-pointer" @click="removeImage(idx)" />
                  </div>
                </template>
              </div>
            </template>
          </UPageCard>
        </section>

        <section class="space-y-2">
          <p class="px-2 font-semibold">
            Product Video (Optional)
          </p>
          <UPageCard
            variant="soft"
            :ui="{ root: '@container rounded shadow-sm', container: 'p-4 sm:p-4', description: 'text-sm font-medium -mb-2' }">
            <template #description>
              <span>
                Upload product video (optional). Supported formats: MP4, WebM, Ogg.
              </span>
            </template>
            <template #default>
              <div class="grid grid-cols-1 gap-2">
                <div
                  class="relative flex flex-col items-center justify-center rounded border-2 border-dashed border-highlighted/70 text-center w-full px-4 py-9"
                  @dragover.prevent
                  @drop.prevent="handleFileEvent($event, 'video')">
                  <UIcon name="i-lucide-video" class="size-7" />
                  <div class="text-sm font-medium">
                    Click to Upload video or drag & drop
                  </div>
                  <div class="text-xs text-muted mt-1">
                    Max size: 32MB
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    class="absolute inset-0 size-full cursor-pointer opacity-0"
                    @change="handleFileEvent($event, 'video')">
                </div>
                <template v-if="videoPreview">
                  <div class="relative aspect-video w-full overflow-hidden rounded-lg bg-black/75">
                    <!-- <video :src="`/${productData?.video}`" class="w-full h-full object-contain" controls /> -->
                    <video controls class="w-full h-full object-contain" muted playsinline>
                      <source :src="videoPreview" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                    <UButton
                      color="error"
                      variant="ghost"
                      :icon="ui.icons.xFilled"
                      class="absolute top-0 right-0 cursor-pointer"
                      @click="videoFile = null; videoPreview = null; product.video = null" />
                  </div>
                </template>
              </div>
            </template>
          </UPageCard>
        </section>

        <section class="flex items-center justify-end gap-1 *:cursor-pointer py-1.5">
          <UButton
            v-if="mode=='add'"
            color="neutral"
            variant="outline"
            label="Clear all"
            icon="i-lucide-eraser"
            @click="clearAll" />
          <UButton
            v-if="!product.published && mode === 'upd'"
            color="info"
            label="Published"
            :loading="publishLoading"
            icon="i-material-symbols-publish"
            @click="publish" />
          <UButton type="submit" label="Save changes" :loading :icon="ui.icons.add" />
        </section>
      </div>
    </section>
  </UForm>
</template>
