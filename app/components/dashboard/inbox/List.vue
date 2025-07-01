<script lang="ts" setup>
import type { Contact } from '~~/server/database/schema'

defineProps<{ mails: Contact[] }>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="overflow-y-auto divide-y divide-(--ui-border)">
    <div
      v-for="(mail, idx) in mails"
      :key="idx"
      class="p-3 sm:px-4 text-sm cursor-pointer border-l-2 transition-colors"
      :class="[
        mail.unread ? 'text-highlighted' : 'text-toned',
        mail.id === $attrs.modelValue ? 'border-l-primary bg-primary/10' : 'border-l-(--ui-bg) hover:border-l-primary hover:bg-primary/5',
      ]"
      @click="emit('update:modelValue', mail.id)">
      <div class="flex justify-between items-center">
        <p>{{ mail.name }}</p>
        <NuxtTime
          v-if="mail.createdAt"
          :datetime="mail.createdAt"
          relative />
      </div>
      <p class="text-dimmed truncate">
        {{ mail.message }}
      </p>
    </div>
  </div>
</template>
