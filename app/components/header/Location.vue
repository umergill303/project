<script lang="ts" setup>
const { profile, fetchProfile } = useProfile()
await fetchProfile()
</script>

<template>
  <div class="flex items-center">
    <UUser
      name="Deliver to"
      :description="profile?.city?? 'Login to set location'"
      :ui="{
        wrapper: '*:font-medium *:text-nowrap cursor-default',
        name: 'text-muted text-xs cursor-pointer',
        description: 'text-toned text-sm truncate max-w-30',
      }">
      <template #avatar>
        <UIcon name="i-lucide-map-pin" class="size-5 cursor-pointer" />
      </template>
    </UUser>
  </div>
</template>
