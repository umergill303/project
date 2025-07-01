<script setup lang="ts">
const appConfig = useAppConfig()
const isSidebarOpen = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="relative">
    <div class="md:hidden mb-4">
      <UButton
        :icon="appConfig.ui.icons.funnel"
        label="Filters"
        size="sm"
        color="primary"
        variant="outline"
        class="w-full justify-center"
        @click="toggleSidebar" />
    </div>

    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-white dark:bg-gray-900 bg-opacity-50 transition-opacity md:hidden"
      @click="closeSidebar" />

    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full md:w-60 xl:w-70 w-80  transform transition-all duration-300 ease-in-out',
        'md:relative md:z-0 md:translate-x-0  md:rounded-lg border border-default',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]">
      <div class="flex items-center justify-between p-4  border-b  border-default bg-gray-50 dark:bg-slate-900">
        <h2 class="text-lg font-bold ">
          Filter Products
        </h2>
        <UButton
          :icon="appConfig.ui.icons.xFilled"
          color="primary"
          variant="ghost"
          size="sm"
          :padded="false"
          class="md:hidden"
          @click="closeSidebar" />
      </div>

      <div class="overflow-y-auto h-[calc(100%-120px)] p-4 space-y-6">
        <div class="space-y-3">
          <h3 class="flex items-center text-sm font-semibold  uppercase tracking-wider">
            <UIcon name="i-lucide-tag" class="px-3 size-4" />
            Categories
          </h3>
          <div class="space-y-2">
            <UCheckbox
              v-for="n in 7"
              :key="n"
              label="Apple"
              color="primary"
              class=" px-2 py-1.5 rounded-md transition-colors" />
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="flex items-center text-sm font-semibold  uppercase tracking-wider">
            <UIcon name="i-lucide-house" class="size-4 px-3" />
            Brands
          </h3>
          <div class="space-y-2 ">
            <UCheckbox
              v-for="n in 9"
              :key="n"
              label="Nike"
              color="primary"
              class=" px-2 py-1.5 rounded-md transition-colors" />
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 p-3 border-t  border-default">
        <UButton
          label="Clear All"
          color="primary"
          block
          variant="outline" />
      </div>
    </aside>
  </div>
</template>
