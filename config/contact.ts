import { UInput, UTextarea } from '#components'

export const formField = [
  { name: 'name', label: 'Name', placeholder: 'Your name', icon: 'i-lucide-user', component: UInput, required: true },
  { name: 'phone', label: 'Phone number', placeholder: 'Your phone number', icon: 'i-lucide-phone', component: UInput, type: 'number', required: true },
  { name: 'subject', label: 'Subject', placeholder: 'Subject', icon: 'i-lucide-mail', component: UInput, required: true, class: 'col-span-2' },
  { name: 'message', label: 'Message', placeholder: 'Your message', component: UTextarea, required: true, class: 'col-span-2' },
]
