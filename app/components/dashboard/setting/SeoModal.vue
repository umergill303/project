<script lang="ts" setup>
import * as z from 'zod'
import { UInput, UTextarea } from '#components'

const emit = defineEmits(['update:isOpen', 'refresh'])
type Page = {
  title: string
  desc: string
  pageTitle: string
  pageDescription: string
}
const props = defineProps<{ isOpen: boolean, page: Page, seoData: Record<string, string> }>()

const seoSchema = z.object({
  pageTitle: z.string()
    .min(3, { message: 'Page title must be at least 3 characters' })
    .max(60, { message: 'Page title should not exceed 60 characters' }),
  pageDescription: z.string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(200, { message: 'Description should not exceed 160 characters' })
})

type SeoSchema = z.infer<typeof seoSchema>

const { ui } = useAppConfig()
const state = reactive<SeoSchema>({ pageTitle: '', pageDescription: '' })

watchEffect(() => {
  if (props.isOpen) {
    state.pageTitle = props.seoData?.[props.page.pageTitle] || ''
    state.pageDescription = props.seoData?.[props.page.pageDescription] || ''
  }
})

const clearModal = () => {
  state.pageTitle = ''
  state.pageDescription = ''
  emit('update:isOpen', false)
}

const saving = ref(false)
const saveField = async () => {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append(props.page.pageTitle, state.pageTitle)
    formData.append(props.page.pageDescription, state.pageDescription)

    await $fetch('/api/pageSeo', { method: 'PATCH', body: formData })
    clearModal()
    emit('refresh')
    showToast('seoUpdated')
  }
  catch (error) {
    console.error('Error saving SEO:', error)
    showToast('error')
  }
  finally { saving.value = false }
}

const formFields = [
  { name: 'pageTitle', label: 'Page Title', component: UInput, placeholder: `Add ${props.page.title} Title` },
  { name: 'pageDescription', label: 'Page Description', component: UTextarea, placeholder: `Add ${props.page.title} Description` }
]
</script>

<template>
  <UModal
    :open="isOpen"
    :title="page.title"
    :description="page.desc"
    :close="{ color: 'neutral', variant: 'soft', onClick: () => { clearModal() } }">
    <template #body>
      <UForm :state="state" class="space-y-3" :schema="seoSchema" :validate-on="['submit']" @submit="saveField">
        <UFormField
          v-for="field in formFields"
          :key="field.name"
          :name="field.name"
          :label="field.label"
          class="w-full">
          <component
            :is="field.component"
            v-model="(state as Record<string, string>)[field.name]"
            class="w-full"
            :rows="6"
            :placeholder="field.placeholder" />
        </UFormField>
        <div class="flex items-center justify-end gap-1">
          <UButton color="neutral" variant="outline" label="Clear All" :icon="ui.icons.clear" @click="clearModal" />
          <UButton type="submit" label="Save Changes" :icon="ui.icons.add" :loading="saving" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
