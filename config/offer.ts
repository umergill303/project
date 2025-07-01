import { UInput, UTextarea } from '#components'

export const formField = [
  { name: 'name', label: 'Offer Name', placeholder: 'Enter offer name', component: UInput },
  { name: 'startDate', label: 'Start Date', type: 'datetime-local', component: UInput },
  { name: 'endDate', label: 'End Date', type: 'datetime-local', component: UInput },
  { name: 'discount', label: 'Discount', type: 'number', component: UInput },
  { name: 'description', label: 'Description', placeholder: 'Enter description', component: UTextarea, class: ' sm:col-span-4' },
]
