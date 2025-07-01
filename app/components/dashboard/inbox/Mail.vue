<script lang="ts" setup>
import type { Contact } from '~~/server/database/schema'

const emits = defineEmits(['close'])
const props = defineProps<{ mail: Contact & { avatar?: string | null } }>()
console.log('Mail', props.mail)
</script>

<template>
  <UDashboardPanel id="inbox-2">
    <UDashboardNavbar :title="mail.subject?? ''" :toggle="false">
      <template #leading>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="-ms-1.5"
          @click="emits('close')" />
      </template>
    </UDashboardNavbar>

    <div class="flex flex-col sm:flex-row justify-between gap-1 p-3 sm:px-6 border-b border-default">
      <UUser
        :name="mail.name?? undefined"
        provider="cloudflare"
        :description="String(mail.phone)">
        <template #avatar>
          <NuxtImg :src="mail.avatar ?? ''" :provider="mail.avatar?.startsWith('http')? undefined: 'cloudflare'" class="size-8 rounded-full" />
        </template>
      </UUser>
      <p class="max-sm:pl-16 text-muted text-sm sm:mt-2">
        <NuxtTime v-if="mail.createdAt" :datetime="mail.createdAt" relative />
      </p>
    </div>

    <div class="flex-1 p-4 sm:p-6 overflow-y-auto">
      <p class="whitespace-pre-wrap">
        {{ mail.message }}
      </p>
    </div>
  </UDashboardPanel>
</template>
