<script setup lang="ts">
const { clear, session, user } = useUserSession()
const appConfig = useAppConfig()
const { data: profile, refresh: fetchProfile } = await useFetch('/api/profile')
await fetchProfile()
console.log('account', profile)

// Import useCount composable
const { refreshCart, refreshWish } = useCount()

const items = computed(() => [
  [
    {
      label: profile?.value?.email || user?.value?.email || 'Guest',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user-round',
      to: '/profile',
    },
    {
      label: 'Orders',
      icon: 'i-lucide-shopping-bag',
      to: '/orders',
    },
    {
      label: (session.value?.user?.password === '') ? 'Set Password' : 'Change Password',
      icon: appConfig.ui.icons.password,
      to: (session.value?.user?.password === '') ? 'set-password' : '/change-password',
    },
  ],
  [
    {
      label: 'Sign out',
      icon: appConfig.ui.icons.logout,
      class: 'cursor-pointer',
      onSelect: async () => {
        await clear() // Clear the user session
        await Promise.all([refreshCart(), refreshWish()]) // Refresh cart and wish counts
        navigateTo('/', { replace: true }) // Redirect to home
      },
    },
  ],
])

const chip = computed(() => { return { color: user?.value?.active ? 'success' : 'neutral' } })
</script>

<template>
  <UDropdownMenu :items="items">
    <div class="flex items-center gap-7">
      <UUser
        name="Hi, Welcome"
        :description="profile?.name ?? ''"
        :ui="{
          wrapper: '*:font-medium *:text-nowrap cursor-pointer',
          name: 'text-muted text-xs',
          description: 'text-toned text-sm',
        }">
        <template #avatar>
          <NuxtImg
            class="size-7 rounded-full cursor-pointer"
            :src="profile?.avatar || '/profile/blank.jpeg'"
            :provider="profile?.avatar?.startsWith('https') ? undefined : 'cloudflare'" />
        </template>
      </UUser>
      <UIcon name="i-ri-arrow-down-s-line" class="size-7 cursor-pointer" />
    </div>
  </UDropdownMenu>
</template>
