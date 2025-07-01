<script lang="ts" setup>
import { Business, currencies } from '~~/config/about'
import { useAbout } from '~/composables/useAbout'

type Currency = {
  code: string
  symbol: string
}

type BusinessState = {
  [key: string]: string | number | boolean | Currency | undefined
  currency?: Currency
}

const saving = ref(false)
const { ui } = useAppConfig()
const state = ref<BusinessState>({})
const isEditing = ref<Record<string, boolean>>({})
const originalState = ref<BusinessState>({})

const { aboutData, fetchAbout } = useAbout()

const getCurrencyDisplay = (currency: Currency) => {
  const foundCurrency = currencies.find(c => c.code === currency.code)
  return foundCurrency ? `${foundCurrency.name} ${foundCurrency.symbol}` : `${currency.code} ${currency.symbol}`
}

onMounted(async () => {
  await fetchAbout()
  const data = { ...aboutData.value } as BusinessState
  if (data.currencyCode && data.currencySymbol) {
    data.currency = {
      code: data.currencyCode as string,
      symbol: data.currencySymbol as string
    }
  }
  state.value = { ...data }
  originalState.value = { ...data }
})

watch(aboutData, newData => {
  const data = { ...newData } as BusinessState
  if (data.currencyCode && data.currencySymbol) {
    data.currency = {
      code: data.currencyCode as string,
      symbol: data.currencySymbol as string
    }
  }
  state.value = { ...data }
  originalState.value = { ...data }
})

const toggleEdit = (key: string) => {
  isEditing.value[key] = true
  nextTick(() => document.getElementById(`${key}-input`)?.focus())
}

const cancelEdit = (key: string) => {
  state.value[key] = originalState.value[key] ?? ''
  isEditing.value[key] = false
}
const saveField = async (key: string) => {
  if (saving.value) return
  isEditing.value[key] = false

  const oldValue = originalState.value[key]
  const newValue = state.value[key]

  const isChanged = key === 'currency'
    ? (oldValue as Currency)?.code !== (newValue as Currency)?.code
    || (oldValue as Currency)?.symbol !== (newValue as Currency)?.symbol
    : oldValue !== newValue

  if (!isChanged) return

  saving.value = true
  try {
    const formData = new FormData()

    if (key === 'currency' && newValue && typeof newValue === 'object') {
      const currencyValue = newValue as Currency
      formData.append('currencyCode', currencyValue.code)
      formData.append('currencySymbol', currencyValue.symbol)
      useState('currencySymbol').value = currencyValue.symbol
    }
    else {
      formData.append(key, String(newValue))
    }

    await $fetch('/api/about', { method: 'PATCH', body: formData })
    originalState.value[key] = state.value[key]
    showToast('aboutUpdated')
  }
  catch { showToast('error') }
  finally { saving.value = false }
}
</script>

<template>
  <UForm :state="state">
    <UPageCard
      v-for="section in Business"
      :key="section.title"
      variant="soft"
      :title="section.title"
      :description="section.description"
      :icon="section.icon"
      :ui="{ root: 'shadow-sm', wrapper: 'flex flex-row gap-4', description: '-mt-0.5', leading: 'mt-1 py-1 bg-primary/5 border border-primary/25 rounded px-2', leadingIcon: `size-7 ${section.iconColor}` }">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <UFormField v-for="field in section.keys" :key="field.key" :label="field.label">
          <component
            :is="field.component"
            v-if="isEditing[field.key]"
            :id="`${field.key}-input`"
            v-model="state[field.key]"
            :type="field.type"
            :items="field.options"
            class="w-full"
            variant="soft"
            size="lg"
            @keydown.enter.prevent="saveField(field.key)"
            @keydown.esc.prevent="cancelEdit(field.key)"
            @blur="saveField(field.key)" />
          <div v-else class="flex items-center justify-between group">
            <p v-if="field.key === 'currency'" class="text-base">
              {{ state[field.key] ? getCurrencyDisplay(state[field.key] as Currency) : 'Not set' }}
            </p>
            <p v-else class="text-base truncate">
              {{ state[field.key] || 'Not set' }}
            </p>
            <UButton color="neutral" variant="link" :icon="ui.icons.edit2" @click="toggleEdit(field.key)" />
          </div>
        </UFormField>
      </div>
    </UPageCard>
  </UForm>
</template>
