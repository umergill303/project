<script lang="ts" setup>
const appConfig = useAppConfig()
async function onClick() {
  return new Promise<void>(res => {
    showToast()
    setTimeout(res, 1000)
  })
}
const toast = useToast()
function showToast() {
  toast.add({
    description: 'Thanks for Shopping.',
    color: 'secondary',
  })
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="max-w-xl text-center">
      <div class="text-primary text-center mb-4">
        <UIcon name="i-lucide-circle-check" class="mt-1 size-14" />
      </div>
      <h1 class="text-2xl font-bold mb-4">
        Thanks For Your Order!
      </h1>
      <p class="mb-6 md:line-clamp-3">
        Thank you for your order! Your order is being processed and will be
        completed within 3-6 hours. You will receive an email confirmation
        when your order is completed.
      </p>
      <div class="flex flex-col md:flex-row justify-center gap-3">
        <UButton
          to="/"
          loading-auto
          icon="i-lucide-shopping-cart"
          size="lg"
          color="neutral"
          label="Continue Shopping"
          class="cursor-pointer px-4 py-2 w-full md:w-auto hover:scale-105 hover:bg-neutral-500"
          @click="onClick" />
        <UButton
          to="/orders/"
          loading-auto
          icon="i-lucide-eye"
          size="lg"
          variant="outline"
          color="neutral"
          label="View Your Order"
          class="cursor-pointer px-4 py-2 w-full md:w-auto hover:scale-105"
          @click="onClick" />
      </div>
    </div>
  </div>
</template>
