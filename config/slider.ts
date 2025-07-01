import { UInput, USelect } from '#components'
import LeftAligned from '~/components/dashboard/slider/LeftAligned.vue'
import BottomAlign from '~/components/dashboard/slider/BottomAlign.vue'
import RightAligned from '~/components/dashboard/slider/RightAligned.vue'
import DefaultLayout from '~/components/dashboard/slider/DefaultLayout.vue'

export const btnColors = [
  { value: 'neutral', label: 'Default' },
  { value: 'info', label: 'Blue' },
  { value: 'error', label: 'Red' },
  { value: 'primary', label: 'Green' },
  { value: 'warning', label: 'Yellow' }
]

export const layouts = [
  { key: 'default', name: 'Default', component: DefaultLayout },
  { key: 'left', name: 'Left Aligned', component: LeftAligned },
  { key: 'right', name: 'Right Aligned', component: RightAligned },
  { key: 'bottom', name: 'Bottom Aligned', component: BottomAlign }
]

export const sliderConfig = (mapCate: Ref<Array<{ value: string | number, label: string }>>) => {
  const formFields = [
    { name: 'buttonText', label: 'Button Text', placeholder: 'e.g. Shop Now', component: UInput },
    { name: 'buttonColor', label: 'Button Color', component: USelect, items: btnColors, valueKey: 'value' },
    { name: 'category', label: 'Category', component: USelect, items: mapCate.value, valueKey: 'value' },
  ]
  watch(mapCate, newVal => {
    const categoryField = formFields.find(f => f.name === 'category')
    if (categoryField) { categoryField.items = newVal }
  })
  return { formFields }
}
