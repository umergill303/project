<script setup lang="ts">
interface Image { file?: File, filePreview: string }

const { ui } = useAppConfig()
const isUploading = ref(false)
const images = ref<Image[]>([])
const hasImagesError = ref(false)
const hasImageSquareError = ref(false)

// Expose images to parent component
defineExpose({
  images: readonly(images),
  validate: () => {
    if (images.value.length === 0) {
      hasImagesError.value = true
      return false
    }
    return true
  }
})

function isSquareImage(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(img.src) // Clean up memory
      resolve(img.width === img.height)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
  })
}

const handleFileEvent = (event: Event | DragEvent) => {
  const files = event instanceof DragEvent
    ? event.dataTransfer?.files
    : (event.target as HTMLInputElement).files

  if (!files || !files.length) return
  handleFiles(files)

  // Clear input value to allow re-selecting same file
  if (event.target instanceof HTMLInputElement) {
    event.target.value = ''
  }
}

async function handleFiles(files: FileList) {
  isUploading.value = true
  const maxFiles = 10
  if (images.value.length + files.length > maxFiles) {
    hasImagesError.value = true
    isUploading.value = false
    return
  }
  try {
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        if (file.size > 8 * 1024 * 1024) {
          continue
        }
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
        reader.onerror = () => {
          console.error(`Failed to read file: ${file.name}`)
        }
        reader.readAsDataURL(file)
      }
    }
  }
  catch (error) { console.error('Error handling files:', error) }
  finally { isUploading.value = false }
}

function removeImage(idx: number) {
  // Clean up object URL to prevent memory leaks
  const image = images.value[idx]
  if (image?.filePreview.startsWith('blob:')) {
    URL.revokeObjectURL(image?.filePreview)
  }
  images.value.splice(idx, 1)
  if (images.value.length === 0) {
    hasImagesError.value = true
  }
}

// Clean up on unmount
onUnmounted(() => {
  images.value.forEach(image => {
    if (image.filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(image.filePreview)
    }
  })
})
</script>

<template>
  <section class="space-y-2">
    <UPageCard
      variant="soft"
      :ui="{
        root: '@container rounded shadow-sm',
        container: 'p-4 sm:p-4',
        description: 'text-sm font-medium -mb-2',
      }">
      <template #description>
        <span v-if="hasImagesError" class="text-error">
          At least one image is required (max 10 images, 8MB each).
        </span>
        <span v-else-if="hasImageSquareError" class="text-error">
          Image must be square (1:1 aspect ratio)
        </span>
        <span v-else-if="isUploading" class="text-primary">
          Processing images...
        </span>
        <span v-else>
          Upload product variant thumbnail (square image recommended).
        </span>
      </template>

      <template #default>
        <div class="grid grid-cols-2 @sm:grid-cols-4 @md:grid-cols-5 @lg:grid-cols-6 gap-2">
          <div
            class="relative flex flex-col items-center justify-center rounded border-2 border-dashed border-highlighted/70 text-center w-full px-4"
            :class="{
              'col-span-full py-9': !images.length,
              '@col-span-2 @md:col-span-2': images.length,
              'opacity-50 pointer-events-none': isUploading,
            }"
            @dragover.prevent
            @dragenter.prevent
            @drop.prevent="handleFileEvent">
            <UIcon :name="isUploading ? 'i-heroicons-arrow-path' : ui.icons.upload" class="size-7" :class="{ 'animate-spin': isUploading }" />
            <div class="text-sm font-medium">
              {{ isUploading ? 'Processing...' : 'Click to Upload or drag & drop' }}
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              :disabled="isUploading"
              class="absolute inset-0 size-full cursor-pointer opacity-0"
              @change="handleFileEvent">
          </div>

          <template v-if="images.length">
            <div
              v-for="(image, idx) in images"
              :key="`${idx}-${image.file?.name}`"
              class="relative aspect-square w-full overflow-hidden rounded-lg group">
              <NuxtImg
                :src="image.filePreview"
                provider="cloudflare"
                class="w-full h-full object-cover bg-(--ui-border-accented) transition-transform group-hover:scale-105"
                :alt="`Product variant image ${idx + 1}`" />
              <UButton
                color="error"
                variant="ghost"
                :icon="ui.icons.xFilled"
                class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                size="xs"
                @click="removeImage(idx)" />
            </div>
          </template>
        </div>
      </template>
    </UPageCard>
  </section>
</template>
