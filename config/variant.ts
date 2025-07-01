import type { VariantConfig } from '~/types/variant'

export const variantConfig: Record<'size' | 'color' | 'combination', VariantConfig> = {
  size: {
    title: 'Size Variants',
    options: sizeOptions.value,
    icon: 'i-heroicons-arrows-pointing-out',
    fields: [
      { prop: 'name', label: 'Size name (e.g., Small)', type: 'text' },
      { prop: 'stock', label: 'Stock', type: 'number' }
    ],
    priceFields: [
      { prop: 'purchasePrice', label: 'Purchase Price', type: 'number' },
      { prop: 'salePrice', label: 'Sale Price', type: 'number' }
    ],
    allFields: [
      { prop: 'name', label: 'Size name (e.g., Small)', type: 'text' },
      { prop: 'stock', label: 'Stock', type: 'number' },
      { prop: 'purchasePrice', label: 'Purchase Price', type: 'number' },
      { prop: 'salePrice', label: 'Sale Price', type: 'number' }
    ]
  },
  color: {
    title: 'Color Variants',
    options: colorOptions.value,
    icon: 'tabler:color-swatch',
    fields: [
      { prop: 'name', label: 'Color name (e.g., Red)', type: 'text', class: 'col-span-2' },
      { prop: 'color', label: 'Color', type: 'color' },
      { prop: 'stock', label: 'Stock', type: 'number' },
    ],
    priceFields: [
      { prop: 'purchasePrice', label: 'Purchase Price', type: 'number' },
      { prop: 'salePrice', label: 'Sale Price', type: 'number' }
    ],
    allFields: [
      { prop: 'name', label: 'Color name (e.g., Red)', type: 'text', class: 'col-span-2' },
      { prop: 'color', label: 'Color', type: 'color' },
      { prop: 'stock', label: 'Stock', type: 'number' },
      { prop: 'purchasePrice', label: 'Purchase Price', type: 'number' },
      { prop: 'salePrice', label: 'Sale Price', type: 'number' }
    ]
  },
  combination: {
    title: 'Combination Variants',
    options: combinationOptions.value,
    icon: 'i-heroicons-squares-plus',
    fields: [
      { prop: 'colorName', label: 'Color Name', type: 'text' },
      { prop: 'colorValue', label: 'Color', type: 'color' },
      { prop: 'sizeName', label: 'Size', type: 'text' },
      { prop: 'stock', label: 'Stock', type: 'number' }
    ],
    priceFields: [
      { prop: 'purchasePrice', label: 'Purchase Price', type: 'number' },
      { prop: 'salePrice', label: 'Sale Price', type: 'number' }
    ],
    allFields: [
      { prop: 'colorName', label: 'Color Name', type: 'text' },
      { prop: 'colorValue', label: 'Color', type: 'color' },
      { prop: 'sizeName', label: 'Size', type: 'text' },
      { prop: 'stock', label: 'Stock', type: 'number' },
      { prop: 'purchasePrice', label: 'Purchase Price', type: 'number' },
      { prop: 'salePrice', label: 'Sale Price', type: 'number' }
    ]
  }
}
