<script setup lang="ts">
import { schema } from '~~/schema/checkout.schema'
import { checkoutFields } from '~~/config/checkout'

const toast = useToast()
const loading = ref(false)
const { loggedIn } = useUserSession()
// const cartCount = useState('cartCount')
const { refreshCart } = useCount()
const { country } = useRuntimeConfig().public.ecommerce

const state = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  province: '',
  country: country,
  city: '',
  district: '',
  code: '',
  agree: false,
  locate: '',
})

async function orderNow() {
  try {
    loading.value = true
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Order successful:', result)
      toast.add({
        title: 'Success',
        icon: 'i-lucide-circle-check',
        description: 'Order Successfully Confirmed',
        color: 'success',
      })
      // cartCount.value = Number(cartCount.value) - Number(products.length)
      navigateTo('/orders/complete')
      refreshCart()
    }
    else {
      console.error('Order failed:', response.statusText)
      showToast('error')
    }
  }
  catch (error) {
    console.error('Error submitting order:', error)
    showToast('error')
  }
  finally { loading.value = false }
}
</script>

<template>
  <div class="">
    <UPageCard
      title="Shipping Address"
      description="Complete shipping information required for delivery">
      <UForm :schema :state @submit="orderNow">
        <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div
            v-for="field in checkoutFields"
            :key="field.name"
            :class="field.class">
            <UFormField
              :label="field.label"
              :name="field.name"
              :required="field.required"
              class="w-full">
              <component
                :is="field.component"
                v-model="(state as Record<string, any>)[field.name]"
                :placeholder="field.placeholder"
                :type="field.type"
                :icon="field.icon"
                :label="field.des"
                :autocomplete="field.autocomplete"
                :readonly="field.readonly"
                :items="field.items"
                size="lg"
                class="w-full" />
            </UFormField>
          </div>
        </div>
        <UButton
          v-if="loggedIn"
          :loading
          type="submit"
          label="Complete Order"
          size="lg"
          block
          class="mt-4 font-medium cursor-pointer"
          icon="i-lucide-shopping-bag"
          :disabled="!state.agree" />
        <UButton
          v-else
          :loading
          to="/login"
          label="Login"
          size="lg"
          block
          class="mt-4 font-medium"
          icon="i-lucide-shopping-bag" />
      </UForm>
    </UPageCard>
  </div>
</template>
