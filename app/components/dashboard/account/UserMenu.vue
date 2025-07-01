<script lang="ts" setup>
const { ui } = useAppConfig()
const isProfileModal = ref(false)
const { clear } = useUserSession()
defineProps<{ collapsed?: boolean }>()
const { profile, fetchProfile } = useProfile()
fetchProfile()

const items = [
  [
    { label: 'Profile', icon: 'i-lucide-user-round', onSelect: () => { isProfileModal.value = true } },
  ],
  [
    { label: 'Logout', icon: ui.icons.logout, onSelect: async () => { await clear(); navigateTo('/', { replace: true }) } }
  ]
]
</script>

<template>
  <UDropdownMenu
    :items
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton
      :label="collapsed ? undefined : profile?.name ?? ''"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }">
      <template #leading>
        <NuxtImg
          :src="profile?.avatar || '/profile/blank.jpeg'"
          :provider="((profile?.avatar === '') || profile?.avatar?.startsWith('http')) ? undefined :'cloudflare'"
          :alt="profile?.name ?? ''"
          class="size-6 rounded-full" />
      </template>
    </UButton>
  </UDropdownMenu>
  <DashboardAccountProfileModal v-model:is-open="isProfileModal" />
</template>
