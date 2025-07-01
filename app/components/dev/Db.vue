<script setup>
const seeding = ref(false)
const clearing = ref(false)
const toast = useToast()
async function seedDB() {
  seeding.value = true

  await $fetch('/api/seed/db')

  seeding.value = false
  toast.add({ title: '✅ DB Seeded Successfully!', color: 'success' })
}

async function clearDB() {
  clearing.value = true
  await $fetch('/api/seed/clear')
  clearing.value = false
  toast.add({ title: '✅ DB Cleared Successfully!', color: 'success' })
}
</script>

<template>
  <UPageCard variant="subtle" class="flex flex-col gap-4">
    <UButton
      :loading="seeding"
      :label="seeding ? 'Seeding DB...' : 'Seed DB'"
      size="xl"
      @click="seedDB" />
    <UButton
      :loading="clearing"
      :label="clearing ? 'clearing DB...' : 'Clear DB'"
      size="xl"
      @click="clearDB" />
  </UPageCard>
</template>
