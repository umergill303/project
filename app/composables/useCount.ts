export const useCount = () => {
  const { data: cart, refresh: refreshCart } = useFetch('/api/cart/count', {
    key: 'cart-count',
    server: false,
    immediate: true,
    // disable Nuxt's internal caching to ensure refetch
    default: () => ({ count: 0 }),
  })

  const { data: wish, refresh: refreshWish } = useFetch('/api/wish/count', {
    key: 'wish-count',
    server: false,
    immediate: true,
    default: () => ({ wishCount: 0 }),
  })

  const cartCount = computed(() => cart.value?.count || 0)
  const wishCount = computed(() => wish.value?.wishCount || 0)

  return {
    cartCount,
    wishCount,
    refreshCart,
    refreshWish,
  }
}
