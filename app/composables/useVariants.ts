import type { Variant } from '~/types/variant'

export const useVariants = () => {
  const sizeOptions = ref<Variant[]>([])
  const colorOptions = ref<Variant[]>([])
  const combOptions = ref<Variant[]>([])

  // Fetch all variants including combinations
  const fetchVariants = async (productId: string) => {
    try {
      const res = await $fetch<{ sizes: Variant[], colors: Variant[], combinations: Variant[] }>
      (`/api/products/variant`, { query: { productId } })
      sizeOptions.value = res?.sizes || []
      colorOptions.value = res?.colors || []
      combOptions.value = res?.combinations?.map(c => ({
        ...c,
        // Ensure the name is properly formatted for display
        name: c.name || `${c.color} - ${c.name}`
      })) || []
    }
    catch (error) {
      console.error('Failed to fetch variants:', error)
    }
  }

  // Create size variant
  const createSizeVariant = async (payload: Variant) => {
    try {
      const variant = await $fetch('/api/products/variant/sizes', { method: 'POST', body: payload })
      sizeOptions.value = [...sizeOptions.value, variant]
      return variant
    }
    catch (err) {
      console.error('Failed to create size variant:', err)
      throw err
    }
  }

  // Update size variant
  const updateSizeVariant = async (payload: Variant) => {
    try {
      const updated = await $fetch('/api/products/variant/sizes', { method: 'PATCH', body: payload })
      sizeOptions.value = sizeOptions.value.map(v =>
        v.id === payload.id ? { ...v, ...updated } : v
      )
      return updated
    }
    catch (err) {
      console.error('Failed to update size variant:', err)
      throw err
    }
  }

  // Create color variant
  const createColorVariant = async (payload: Variant) => {
    try {
      const variant = await $fetch('/api/products/variant/colors', { method: 'POST', body: payload })
      colorOptions.value = [...colorOptions.value, variant]
      return variant
    }
    catch (err) {
      console.error('Failed to create color variant:', err)
      throw err
    }
  }

  // Update color variant
  const updateColorVariant = async (payload: Variant) => {
    try {
      const updated = await $fetch('/api/products/variant/colors', { method: 'PATCH', body: payload })
      colorOptions.value = colorOptions.value.map(v =>
        v.id === payload.id ? { ...v, ...updated } : v
      )
      return updated
    }
    catch (err) {
      console.error('Failed to update color variant:', err)
      throw err
    }
  }

  // Create combination variant
  const createCombinationVariant = async (payload: {
    productId: string
    name?: string
    color: string
    size: string
    purchasePrice: number
    salePrice: number
    stock: number
    discount: number
  }) => {
    try {
      const variant = await $fetch('/api/products/variant/combination', {
        method: 'POST',
        body: {
          ...payload,
          name: payload.name || `${payload.color} - ${payload.size}`
        }
      })
      combOptions.value = [...combOptions.value, variant]
      return variant
    }
    catch (err) {
      console.error('Failed to create combination variant:', err)
      throw err
    }
  }

  // Update combination variant
  // app/composables/useVariants.ts
  const updateCombinationVariant = async (payload: {
    variantId: string
    productId: string
    color?: string
    size?: string
    purchasePrice?: number
    salePrice?: number
    stock?: number
    discount?: number
  }) => {
    try {
      const updated = await $fetch(`/api/products/variant/combination/${payload.variantId}`, {
        method: 'PATCH',
        body: {
          color: payload.color,
          size: payload.size,
          purchasePrice: payload.purchasePrice,
          salePrice: payload.salePrice,
          stock: payload.stock,
          discount: payload.discount,
          name: payload.color && payload.size ? `${payload.color} - ${payload.size}` : undefined
        }
      })

      combOptions.value = combOptions.value.map(v =>
        v.id === payload.variantId ? { ...v, ...updated } : v
      )
      return updated
    }
    catch (err) {
      console.error('Failed to update combination variant:', err)
      throw err
    }
  }

  // Delete combination variant
  const deleteCombinationVariant = async (variantId: string) => {
    try {
      await $fetch(`/api/products/variant/combination/${variantId}`, {
        method: 'DELETE'
      })
      combOptions.value = combOptions.value.filter(v => v.id !== variantId)
      showToast('combinationVariantDeleted')
    }
    catch (err) {
      console.error('Failed to delete combination variant:', err)
      showToast('error')
    }
  }

  // Modified deleteVariant to handle combinations
  const deleteVariant = async (variantId: string, type: 'size' | 'color' | 'combination') => {
    if (type === 'combination') {
      return deleteCombinationVariant(variantId)
    }
    try {
      await $fetch(`/api/products/variant/${type}/${variantId}`, { method: 'DELETE' })
      if (type === 'size') {
        sizeOptions.value = sizeOptions.value.filter(s => s.id !== variantId)
        showToast('sizeVariantDeleted')
      }
      else {
        colorOptions.value = colorOptions.value.filter(s => s.id !== variantId)
        showToast('colorVariantDeleted')
      }
    }
    catch {
      showToast('error')
    }
  }

  return {
    combOptions,
    fetchVariants,
    deleteVariant,
    createCombinationVariant,
    updateCombinationVariant,
    sizeOptions,
    createSizeVariant,
    updateSizeVariant,
    colorOptions,
    createColorVariant,
    updateColorVariant,
  }
}
