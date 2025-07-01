<template>
  <UCard
    ref="chartRef"
    variant="soft"
    :ui="{
      root: 'divide-y-0 shadow-sm',
      header: 'pt-2.5 flex justify-between items-center',
      body: '!px-0 !pt-0 !pb-3',
    }"
    class="w-full">
    <template #header>
      <div>
        <div class="flex items-center">
          <p class="font-medium text-lg">
            Revenue
          </p>
          <UButton
            size="sm"
            variant="link"
            label="0.0%"
            color="primary"
            trailing-icon="i-typcn-arrow-up" />
        </div>
        <p class="text-xl text-primary font-medium">
          -------
        </p>
      </div>
      <div class="flex items-center gap-1 *:px-4">
        <USkeleton class="h-7 w-16 border border-muted" />
        <USkeleton class="h-7 w-16 border border-muted" />
        <USkeleton class="h-7 w-16 border border-muted" />
      </div>
    </template>
  </UCard>
</template>
