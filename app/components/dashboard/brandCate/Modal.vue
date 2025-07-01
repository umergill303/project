<script lang="ts" setup>
import type { Brand, Category, Tag } from '~~/server/database/schema'

const loading = ref(false)
const { ui } = useAppConfig()
const props = defineProps<{
  api: string
  title: string
  isOpen: boolean
  featured?: boolean
  modalMode: 'add' | 'upd'
  defaultValue: Brand | Category | Tag | null }>()
const emit = defineEmits(['update:isOpen', 'refresh'])

type BrandOrCategoryState = {
  name: string
  logo?: string
  featured?: boolean
}

const state = ref<BrandOrCategoryState>({ name: '', logo: '', featured: false })

watch(() => props.defaultValue, newState => {
  if (newState) {
    state.value.name = newState.name ?? ''
    state.value.logo = 'logo' in newState ? newState.logo ?? '' : ''
    filePreview.value = 'logo' in newState ? newState.logo ?? '' : ''
    if (props.featured) {
      state.value.featured = 'featured' in newState ? Boolean(newState.featured) : false
    }
  }
  else {
    state.value = { name: '', logo: '' }
    filePreview.value = null
  }
})

const isCloudflare = computed(() =>
  props.modalMode === 'upd' && filePreview.value === props.defaultValue?.logo
)

const hasNameError = ref(false)
const hasImageError = ref(false)
const file = ref<File | null>(null)
const hasImageSquareError = ref(false)
const filePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function isSquareImage(file: File): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      resolve(img.width === img.height)
    }
  })
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const selectedFile = input.files?.[0] || null
  if (selectedFile) {
    const isSquare = await isSquareImage(selectedFile)
    if (!isSquare) {
      hasImageSquareError.value = true
      file.value = null
      filePreview.value = null
      return
    }
    hasImageSquareError.value = false
    hasImageError.value = false
    file.value = selectedFile
    filePreview.value = URL.createObjectURL(selectedFile)
  }
}
async function handleDrop(event: DragEvent) {
  event.preventDefault()
  const selectedFile = event.dataTransfer?.files[0]
  if (selectedFile) {
    const isSquare = await isSquareImage(selectedFile)
    if (!isSquare) {
      hasImageSquareError.value = true
      file.value = null
      filePreview.value = null
      return
    }
    hasImageSquareError.value = false
    hasImageError.value = false
    file.value = selectedFile
    filePreview.value = URL.createObjectURL(selectedFile)
  }
}

const submit = async () => {
  loading.value = true
  hasNameError.value = state.value.name === ''
  if (props.title !== 'tags') { hasImageError.value = !file.value && !filePreview.value }

  if (hasNameError.value || hasImageError.value) {
    loading.value = false
    return
  }

  try {
    const formData = new FormData()
    formData.append('data', JSON.stringify({ name: state.value.name, featured: state.value.featured ? 1 : 0 }))
    if (file.value) { formData.append('file', file.value) }

    const method = props.modalMode === 'add' ? 'POST' : 'PATCH'
    const url = method === 'POST' ? props.api : `${props.api}/${props.defaultValue?.id}`
    await $fetch(url, { method, body: props.title === 'tags' ? { name: state.value.name } : formData })

    const toastKey = {
      brands: { add: 'brandAdded', upd: 'brandUpdated' },
      categories: { add: 'categoryAdded', upd: 'categoryUpdated' },
      tags: { add: 'tagAdded', upd: 'tagUpdated' },
    }[props.title]?.[props.modalMode]

    showToast(toastKey || 'error')

    // Reset properly
    filePreview.value = null
    state.value = { name: '', logo: '' }
    emit('refresh')
    emit('update:isOpen', false)
  }
  catch { showToast('error') }
  finally { loading.value = false }
}

function clearAll() {
  state.value = { name: '', logo: '' }
  filePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <UModal
    :open="isOpen"
    :title="`Manage ${title}`"
    description="Create a new entry or update an existing one to keep your store organized."
    :close="{ color: 'neutral', variant: 'link', class: 'cursor-pointer', onClick: () => { clearAll(), emit('update:isOpen', false) } }"
    :ui="{ content: 'divide-y-0', body: 'py-3 sm:py-3 px-0 sm:px-0 mx-5 border-t border-(--ui-border)' }">
    <template #body>
      <UForm :state class="space-y-2" @submit.prevent="submit">
        <UFormField name="name" label="Enter the name" class="w-full" :ui="{ description: hasNameError ? 'text-error': '' }">
          <UInput v-model="state.name" :placeholder="`Enter ${title} name`" :class="title === 'tags'? 'w-full': 'w-1/2'" autofocus />
        </UFormField>
        <template v-if="title !== 'tags'">
          <UFormField name="logo" :description="hasImageSquareError ? 'Image must be square (1:1).': `Upload an image file for the ${title}.`" required :ui="{ description: hasImageError || hasImageSquareError? 'text-error': '' }">
            <div class="grid grid-cols-2 gap-2">
              <div
                class="relative flex flex-col h-30 sm:h-40 md:h-50 cursor-pointer items-center justify-center rounded border-2 border-dashed border-highlighted/70"
                :class="filePreview? 'col-span-1': 'col-span-2'"
                @dragover.prevent
                @drop.prevent="handleDrop">
                <input ref="fileInput" type="file" accept="image/*" class="absolute inset-0 cursor-pointer opacity-0" @change="handleFileChange">
                <UIcon :name="ui.icons.upload" class="size-7" />
                <div class="flex text-sm text-center font-medium">
                  Click to Upload or<br>
                  drag & drop
                </div>
              </div>
              <NuxtImg v-if="filePreview" :src="filePreview" :provider="isCloudflare? 'cloudflare': undefined" class="h-30 sm:h-40 md:h-50 w-full rounded shadow-sm object-center object-cover" />
            </div>
          </UFormField>
          <UCheckbox v-if="featured" v-model="state.featured" label="Featured category" :ui="{ base: 'cursor-pointer', label: 'cursor-pointer' }" />
        </template>
        <div class="flex items-center justify-end gap-1 pt-2 *:cursor-pointer">
          <UButton color="neutral" variant="outline" label="Clear all" icon="i-lucide-eraser" @click="clearAll" />
          <UButton type="submit" :loading label="Save Changes" :icon="ui.icons.add" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
