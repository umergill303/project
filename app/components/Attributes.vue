<script setup lang="ts">
import { AttributeType } from '#shared/types/enums'

const emit = defineEmits(['refresh'])
const props = defineProps<{
  product: Product
}>()

const attributeState = reactive({ name: '', type: 'Button' })
const { data: attributes, refresh } = await useFetch(`/api/products/${props.product.id}/attributes`)
console.log('attributes', attributes.value)
async function refreshAllVariants() {
  await refresh()
  await emit('refresh')
}
// Available attribute types for dropdown
const attributeTypeOptions = Object.values(AttributeType).map(type => ({
  label: type,
  value: type
}))

const isAdding = ref(false)
async function addAttribute(e) {
  console.log('addAttribute', e.data)
  if (props.product.activeVariants === true) {
    const confirmed = window.confirm(
      'Are you sure? All your active variants will be moved to inactive when you add a new attribute.'
    )
    if (!confirmed) return
  }
  isAdding.value = true
  try {
    const res = await $fetch(`/api/products/${props.product.id}/attributes`, {
      method: 'POST',
      body: e.data,
    })
    attributeState.name = ''
    attributeState.type = 'Button'
    refreshAllVariants()

    console.log('attribute res', res)
  }
  catch { console.log('Failed to add Attribute') }
  finally { isAdding.value = false }
}

const loading = ref({})
async function delAttribute(id: number) {
  loading.value[id] = true
  if (props.product.activeVariants === true) {
    const confirmed = window.confirm(
      'Are you sure? All your active variants will be moved to inactive when you delete an attribute.'
    )
    if (!confirmed) return
  }
  try {
    console.log('delAttribute', id)
    const res = await $fetch(`/api/products/${props.product.id}/attributes/${id}`, {
      method: 'DELETE',
    })
    refreshAllVariants()
    console.log('attribute res', res)
  }
  catch (error) { console.log('Failed to DElete attr', error) }
  finally { loading.value[id] = false }
}
</script>

<template>
  <UCard variant="soft" :ui="{ header: 'flex justify-between' }">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5" />
        <h3 class="text-lg font-semibold">
          Manage Attributes
        </h3>
      </div>
    </template>
    <div class="space-y-6">
      <!-- Add New Attribute -->
      <UCard>
        <h4 class="font-medium mb-3">
          Add New Attribute
        </h4>
        <UForm :state="attributeState" class="flex gap-2" @submit="addAttribute">
          <UInput v-model="attributeState.name" variant="subtle" placeholder="Attribute name (e.g., Size, Color)" class="flex-1" />
          <USelect v-model="attributeState.type" variant="subtle" :items="attributeTypeOptions" placeholder="Select type" class="w-32 sm:w-40" />
          <UButton label="Add Attribute" :loading="isAdding" :disabled="!attributeState.name.trim()" icon="i-heroicons-plus" type="submit" />
        </UForm>
      </UCard>
      <!-- Existing Attributes -->
      <div v-if="attributes && attributes.length > 0" class="space-y-4">
        <h4 class="font-medium">
          Existing Attributes ({{ attributes.length }})
        </h4>
        <UCard v-for="attribute in attributes" :key="attribute.id">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <h5 class="text-lg font-medium">
                {{ attribute.name }}
              </h5>
              <UBadge :label="attribute.attributeType" variant="subtle" size="sm" />
              <UBadge :label="`${attribute.options.length} options`" variant="subtle" size="sm" color="neutral" />
            </div>
            <div class="flex gap-1">
              <UButton
                label="Remove Attribute"
                icon="i-heroicons-trash"
                :loading="loading[attribute.id]"
                color="error"
                variant="soft"
                size="sm"
                @click="delAttribute(attribute.id)" />
            </div>
          </div>
          <!-- Options -->
          <div class="space-y-2">
            <AttributeOptions
              :options="attribute.options"
              :attribute-id="attribute.id"
              :attribute-type="attribute.attributeType"
              :product="props.product"
              @refresh="refreshAllVariants" />
          </div>
        </UCard>
      </div>
    </div>
  </UCard>
</template>
