<script lang="ts" setup>
import { defaultCoupon } from '~~/default/coupon'
import type { Coupon } from '~~/server/database/schema'
import { couponSchema } from '#shared/utils/couponSchema'
import { UInput, UTextarea, UCheckbox } from '#components'

const loading = ref(false)
const { ui } = useAppConfig()
const state = ref({ ...defaultCoupon })
const emit = defineEmits(['update:isOpen', 'refresh'])
const props = defineProps<{ isOpen: boolean, defaultValue: Coupon | null, modalMode: 'add' | 'upd' }>()

const form = ref() // Add form ref

watch(() => props.defaultValue, val => {
  if (props.modalMode === 'upd' && val) {
    // Convert dates to local datetime format for the input fields
    state.value = {
      ...defaultCoupon,
      ...val,
      startDate: convertToLocalDatetime(val.startDate ?? ''),
      endDate: convertToLocalDatetime(val.endDate ?? '')
    }
  }
  else {
    state.value = { ...defaultCoupon }
  }
})

// Helper function to convert ISO string to local datetime string
const convertToLocalDatetime = (isoString: string) => {
  const date = new Date(isoString)
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .slice(0, 16)
}

const clearAll = () => {
  state.value = { ...defaultCoupon }
  emit('update:isOpen', false)
  emit('refresh')
}

const submitCoupon = async () => {
  try {
    // Validate form first
    await form.value.validate()

    loading.value = true

    // Prepare the data with proper date formatting
    const formData = {
      ...state.value,
      active: !!state.value.active,
      firstOrderOnly: !!state.value.firstOrderOnly,
      // Convert local datetime back to ISO string
      startDate: new Date(state.value.startDate ?? '').toISOString(),
      endDate: new Date(state.value.endDate ?? '').toISOString()
    }

    const isUpd = props.modalMode === 'upd'
    const method = isUpd ? 'PATCH' : 'POST'
    const endPoint = isUpd ? `/api/coupons/${props.defaultValue?.id}` : '/api/coupons'

    await $fetch(endPoint, { method, body: formData })
    clearAll()
    showToast('couponSaved')
  }
  catch (error) {
    console.error(error)
    showToast('error')
  }
  finally { loading.value = false }
}

const formField = [
  { name: 'code', label: 'Coupon Code', placeholder: 'Enter coupon code', component: UInput },
  { name: 'discount', label: 'Discount (%)', type: 'number', component: UInput },
  { name: 'minOrderAmount', label: 'Minimum Order Amount', type: 'number', component: UInput },
  { name: 'usageLimit', label: 'Usage Limit', type: 'number', component: UInput },
  { name: 'usedCount', label: 'Used Count', type: 'number', component: UInput, disabled: true },
  { name: 'startDate', label: 'Start Date', type: 'datetime-local', component: UInput, required: true },
  { name: 'endDate', label: 'End Date', type: 'datetime-local', component: UInput, required: true },
  { name: 'description', label: 'Description', placeholder: 'Enter description', component: UTextarea, class: 'col-span-2' },
  { name: 'active', checkboxLabel: 'Enable This Offer Now', component: UCheckbox, class: 'col-span-2' },
  { name: 'firstOrderOnly', checkboxLabel: 'Apply Discount to First Order Only', component: UCheckbox, class: 'col-span-2' },
]
</script>

<template>
  <UModal
    :open="isOpen"
    :close="false"
    :title="modalMode === 'upd'? 'Update Coupon':'Create New Coupon'"
    description="Set up discount coupons with custom codes, expiry, and usage limits."
    :ui="{ body: 'p-3 sm:p-3 sm:px-5' }">
    <template #body>
      <UForm ref="form" :state="state" :schema="couponSchema" @submit="submitCoupon">
        <div class="grid grid-cols-2 gap-2">
          <UFormField
            v-for="field in formField"
            :key="field.name"
            :name="field.name"
            :label="field.label"
            :class="['w-full', field.class]"
            :required="field.required">
            <component
              :is="field.component"
              v-model="state[field.name as keyof typeof state]"
              :type="field.type"
              :disabled="field.disabled"
              :label="field.checkboxLabel"
              :placeholder="field.placeholder"
              :required="field.required"
              :class="['w-full', field.class]" />
          </UFormField>
          <div class="grid grid-cols-2 gap-2 *:justify-center col-span-2 py-1 *:cursor-pointer">
            <UButton color="error" variant="outline" label="Discard" icon="i-lucide-eraser" @click="clearAll" />
            <UButton :loading="loading" label="Save changes" :icon="ui.icons.add" type="submit" />
          </div>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
