<script lang="ts" setup>
import { policies } from '~~/config/about'

const { aboutData, fetchAbout } = useAbout()
await fetchAbout()

const content = ref('')
const loading = ref(false)
const isEditing = ref(false)
const selectedPolicy = ref(null)

const selectPolicy = policy => {
  selectedPolicy.value = policy
  content.value = aboutData.value?.[policy.name] || ''
  isEditing.value = false
}

const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()

const saveChanges = async () => {
  if (!selectedPolicy.value) return
  const cleanText = stripHtml(content.value)
  if (!cleanText) { content.value = '' }
  try {
    loading.value = true
    const formData = new FormData()
    formData.append(selectedPolicy.value.name, content.value)

    await $fetch('/api/about', { method: 'PATCH', body: formData })

    showToast('aboutUpdated')
    await fetchAbout()
    isEditing.value = false
  }
  catch (error) { console.log('Failed to Patch Policies', error) }
  finally { loading.value = false }
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="font-medium">
        Store Policies
      </p>
      <p class="text-sm text-muted font-medium mt-1">
        Learn about our return, refund, and shipping policies.
      </p>
    </div>

    <div v-if="!selectedPolicy" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <UPageCard
        v-for="(policy, i) in policies"
        :key="i"
        variant="soft"
        class="group cursor-pointer shadow-sm"
        @click="selectPolicy(policy)">
        <div class="flex items-center gap-2">
          <UIcon :name="policy.icon" class="size-8" />
          <div class="flex-1">
            <p class="font-medium">
              {{ policy.title }}
            </p>
            <p class="text-sm font-medium text-muted">
              {{ policy.desc }}
            </p>
          </div>
        </div>
      </UPageCard>
    </div>

    <UCard v-if="selectedPolicy" variant="soft" class="shadow">
      <div class="flex justify-between items-center mb-4">
        <div>
          <p class="text-lg font-bold">
            {{ selectedPolicy.title }}
          </p>
          <p class="text-sm text-muted">
            {{ selectedPolicy.desc }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton label="Back" variant="soft" color="neutral" icon="i-lets-icons-back" @click="selectedPolicy = null" />
          <UButton
            :loading
            variant="soft"
            icon="tabler:edit"
            :color="isEditing ? 'primary' : 'info'"
            :label="isEditing ? 'Save Changes' : 'Edit'"
            @click="isEditing ? saveChanges() : (isEditing = true)" />
        </div>
      </div>

      <!-- ✅ CASE 1: No data and not editing -->
      <div v-if="!aboutData[selectedPolicy.name] && !isEditing">
        <DashboardPartialsEmptyCard :title="selectedPolicy.title" />
      </div>

      <!-- ✅ CASE 2: Data exists and not editing -->
      <div v-else-if="!isEditing" class="prose max-w-none" v-html="aboutData[selectedPolicy.name]" />

      <!-- ✅ CASE 3: Editing mode -->
      <DashboardProductsTiptapEditor v-else v-model="content" :editable="isEditing" />
    </UCard>
  </div>
</template>
