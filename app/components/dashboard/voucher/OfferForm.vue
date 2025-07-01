<script lang="ts" setup>
import { formField } from '~~/config/offer'
import type { OfferType } from '#shared/types/offer'
import { offerSchema } from '#shared/utils/offerSchema'

const { ui } = useAppConfig()
defineEmits<{ (e: 'submit'): void }>()
defineProps<{ loading?: boolean, title: string }>()
const state = defineModel<OfferType>({ required: true })
</script>

<template>
  <div class="space-y-5">
    <UForm :state :schema="offerSchema" class="space-y-3" @submit.prevent="$emit('submit')">
      <div class="flex justify-between gap-2 items-center w-full md:3/5 lg:w-2/3">
        <p>{{ `${title} offer` }}</p>
        <UButton :loading type="submit" :label="`${title} offer`" :icon="ui.icons.add" />
      </div>
      <UPageCard variant="soft" :ui="{ root: 'w-full md:3/5 lg:w-2/3 rounded', body: '', container: 'p-3 sm:p-3' }">
        <template #body>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <UFormField
              v-for="field in formField"
              :key="field.name"
              :name="field.name"
              :label="field.label"
              :class="field.class"
              required>
              <component
                :is="field.component"
                v-model.lazy="(state as Record<string, any>)[field.name]"
                variant="subtle"
                :type="field.type"
                :placeholder="field.placeholder"
                :class="['w-full ', field.class]" />
            </UFormField>
          </div>
        </template>
      </UPageCard>
    </UForm>
  </div>
</template>
