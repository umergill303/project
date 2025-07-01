export const useProductTracking = () => {
  const trackView = async (productId: string) => {
    try {
      await $fetch(`/api/products/${productId}/view`, { method: 'POST' })
    }
    catch (error) {
      console.warn('Failed to track product view:', error)
    }
  }

  const trackLike = async (productId: string, increment: boolean = true) => {
    try {
      await $fetch(`/api/products/${productId}/like`, { method: 'POST', body: { increment } })
    }
    catch (error) {
      console.warn('Failed to track product like:', error)
    }
  }

  // const trackShare = async (productId: string) => {
  //   try {
  //     await $fetch(`/api/products/${productId}/share`, {
  //       method: 'POST'
  //     })
  //   }
  //   catch (error) {
  //     console.warn('Failed to track product share:', error)
  //   }
  // }

  return {
    trackView,
    trackLike,
    // trackShare
  }
}
