import type { UTextarea, USelectMenu } from '#components'
import { UCheckbox, UInput, USelect } from '#components'
import { SeasonStatus } from '#shared/types/enums'

import TiptapEditor from '~/components/dashboard/products/TiptapEditor.vue'
import Specifications from '~/components/dashboard/products/Specifications.vue'
import Highlights from '~/components/dashboard/products/Highlights.vue'
import type { Tag, Brand, Category } from '~~/server/database/schema'

interface ColumnFields {
  rows?: number
  name?: string
  min?: number
  label?: string
  type?: string
  class?: string
  valueKey?: string
  multiple?: boolean
  required?: boolean
  placeholder?: string
  description?: string
  transform?: (value: unknown) => unknown
  options?: Array<{ value: string | number | null, label: string }> | Ref<Array<{ value: string | number | null, label: string }>>
  component?: typeof UInput | typeof UTextarea | typeof USelect | typeof UCheckbox | typeof TiptapEditor | typeof USelectMenu | typeof Specifications | typeof Highlights
}

interface ColumnSection {
  grid?: string
  title: string
  fields: ColumnFields[]
}

export const getProductFields = (tags: Ref<Tag[]>, brands: Ref<Brand[]>, categories: Ref<Category[]>, features: { featured?: boolean }) => {
  const brandOptions = computed(() =>
    [
      { value: null, label: '__No Brand__' },
      ...(brands.value ?? [])
        .filter(b => b.id !== undefined && b.name !== undefined)
        .map(b => ({ value: b.id as string | number, label: b.name as string }))
    ])

  const cateOptions = computed(() =>
    [
      { value: null, label: '__No Category__' },
      ...(categories.value ?? [])
        .filter(c => c.id !== undefined && c.name !== undefined)
        .map(c => ({ value: c.id as string | number, label: c.name as string }))
    ])

  const tagOptions = computed(() => (tags.value ?? [])
    .filter(c => c.id !== undefined && c.name !== undefined)
    .map(c => ({ value: c.id as string | number, label: c.name as string })))

  const productFields: ColumnSection[] = [
    {
      title: 'Description',
      grid: 'space-y-2 grid grid-cols-2 items-center gap-x-3',
      fields: [
        { name: 'name', label: 'Product Name', placeholder: 'Product Name', component: UInput, required: true },
        { name: 'description', label: 'Product Description', component: TiptapEditor, required: true, class: 'col-span-2' },
      ]
    },
    {
      title: 'Specifications',
      grid: 'grid grid-cols-1',
      fields: [
        { name: 'specs', component: Specifications },
        { name: 'highlights', component: Highlights }
      ]
    },
    {
      title: 'Classification',
      grid: 'grid grid-cols-2 gap-2',
      fields: [
        { name: 'tags', label: 'Product Tags', valueKey: 'value', placeholder: 'Select tags', component: USelect, multiple: true, options: [...tagOptions.value] },
        { name: 'season', label: 'Product Season', component: USelect, options: SeasonStatus() },
        { name: 'category', label: 'Product Category', placeholder: 'Select a category', valueKey: 'value', multiple: false, component: USelect, options: [...cateOptions.value] },
        { name: 'brand', label: 'Product Brand', placeholder: 'Select a brand', valueKey: 'value', multiple: false, component: USelect, options: [...brandOptions.value] }
      ]
    },
    {
      title: 'Inventory',
      grid: 'grid grid-cols-2 gap-2',
      fields: [
        { name: 'stock', label: 'Product Stock', component: UInput, type: 'number', required: true },
        { name: 'purchasePrice', label: 'Original Price', component: UInput, type: 'number', required: true },
        { name: 'salePrice', label: 'Sale Price', component: UInput, type: 'number', required: true },
        { name: 'discount', label: 'Product Discount', component: UInput, type: 'number', required: true }
      ]
    },
    {
      title: 'Shipping',
      grid: 'grid grid-cols-2 gap-2',
      fields: [
        { name: 'minShippingProducts', label: 'Min Product', component: UInput, type: 'number', min: 1, required: true },
        { name: 'maxShippingProducts', label: 'Max Product', component: UInput, type: 'number', required: true },
        { name: 'estimatedDelivery', class: 'col-span-2' }
      ]
    },
  ]
  const seoColumn: ColumnSection[] = [
    {
      title: 'SEO',
      grid: 'grid grid-cols-1 gap-2',
      fields: [
        { name: 'seoTitle', label: 'SEO Title', component: UInput, placeholder: 'SEO Title', required: true, class: '' },
        { name: 'seoTags', label: 'SEO Tags', valueKey: 'value', placeholder: 'Select tags', component: USelect, multiple: true, options: [...tagOptions.value] },
      ]
    },
  ]
  const featured: ColumnSection[] = [
    {
      title: 'Features',
      fields: [
        ...(features.featured
          ? [{ name: 'featured', label: 'Featured', description: 'Indicates whether the product is marked as featured.',
              component: UCheckbox, transform: (value: unknown) => (value as boolean) ? 1 : 0 }]
          : []),
        { name: 'hVariants', label: 'Product Variant', description: 'Enable if this product has variants such as size or color.', component: UCheckbox, transform: (v: unknown) => (v as boolean) ? 1 : 0 },
        { name: 'freeShipping', label: 'Free Shipping', description: 'Enable this to offer free shipping on the product.', component: UCheckbox, transform: (v: unknown) => (v as boolean) ? 1 : 0 },
        { name: 'brandWarranty', label: 'Brand Warranty', description: 'Warranty provided directly by the product brand.', component: UCheckbox, transform: (v: unknown) => (v as boolean) ? 1 : 0 },
        { name: 'sellerWarranty', label: 'Seller Warranty', description: 'Warranty provided by the seller instead of the brand.', component: UCheckbox, transform: (v: unknown) => (v as boolean) ? 1 : 0 },
      ]
    },
  ]

  return { productFields, featured, seoColumn }
}
