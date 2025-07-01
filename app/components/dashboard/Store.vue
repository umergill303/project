<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { ui } = useAppConfig()
const colorMode = useColorMode()
defineProps<{ collapsed?: boolean }>()

interface AboutData {
  storeLogo?: string
  storeName?: string
}

const { aboutData, fetchAbout } = useAbout() as { aboutData: AboutData, fetchAbout: () => Promise<void> }
await fetchAbout()

const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']
const colors = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']

const items = computed<DropdownMenuItem[][]>(() => (
  [
    [
      { label: 'Visit Website', icon: 'i-lucide-store', to: '/' },
    ],
    [
      { label: 'Settings', icon: 'i-lucide-settings', to: '/dashboard/settings' }
    ],
    [
      {
        label: 'Theme',
        icon: 'i-lucide-palette',
        children: [
          {
            label: 'Primary',
            slot: 'chip',
            chip: ui.colors.primary,
            content: { align: 'center', collisionPadding: 16 },
            children: colors.map(color => (
              {
                label: color,
                chip: color,
                slot: 'chip',
                checked: ui.colors.primary === color,
                type: 'checkbox',
                onSelect: (e: Event) => {
                  e.preventDefault()
                  ui.colors.primary = color
                }
              }
            ))
          },
          {
            label: 'Neutral',
            slot: 'chip',
            chip: ui.colors.neutral,
            content: {
              align: 'end',
              collisionPadding: 16
            },
            children: neutrals.map(color => (
              {
                label: color,
                chip: color,
                slot: 'chip',
                type: 'checkbox',
                checked: ui.colors.neutral === color,
                onSelect: (e: Event) => {
                  e.preventDefault()
                  ui.colors.neutral = color
                }
              }
            ))
          }
        ]
      },
      {
        label: 'Appearance',
        icon: 'i-lucide-sun-moon',
        children: [
          {
            label: 'Light',
            icon: 'i-lucide-sun',
            type: 'checkbox',
            checked: colorMode.value === 'light',
            onSelect(e: Event) {
              e.preventDefault()
              colorMode.preference = 'light'
            }
          },
          {
            label: 'Dark',
            icon: 'i-lucide-moon',
            type: 'checkbox',
            checked: colorMode.value === 'dark',
            onUpdateChecked(checked: boolean) {
              if (checked) {
                colorMode.preference = 'dark'
              }
            },
            onSelect(e: Event) {
              e.preventDefault()
            }
          }
        ]
      }
    ],
  ]
))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton
      :label="collapsed ? undefined : aboutData?.storeName"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated h-10"
      :class="[!collapsed && 'py-2']"
      :ui="{ trailingIcon: 'text-dimmed' }">
      <template #leading>
        <NuxtImg v-if="aboutData?.storeLogo" :src="aboutData?.storeLogo" provider="cloudflare" class="max-w-40" />
      </template>
    </UButton>
    <template #chip-leading="{ item }">
      <span
        :style="{ '--chip': `var(--color-${(item as any).chip}-400)` }"
        class="ms-0.5 size-2 rounded-full bg-(--chip)" />
    </template>
  </UDropdownMenu>
</template>
