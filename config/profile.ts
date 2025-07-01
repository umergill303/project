import { UInput, USelect } from '#components'

export const getProfileFields = () => {
  const { ui } = useAppConfig()
  return [

    { label: 'User Name', name: 'username', component: UInput, props: { placeholder: 'JohnDoe_1', icon: 'i-lucide-user' } },
    { label: 'Name', name: 'name', component: UInput, props: { placeholder: 'John Doe', icon: 'i-lucide-user' } },
    { label: 'Gender', name: 'gender', component: USelect, props: { placeholder: 'Select Gender', items: ['Male', 'Female'], icon: 'i-lucide-transgender' }, editable: false },
    { label: 'Birthday', name: 'birthday', component: UInput, props: { type: 'date', icon: 'i-lucide-calendar' }, editable: false },
    { label: 'Phone', name: 'phone', component: UInput, props: { placeholder: '+92 000 0000000', icon: 'i-lucide-phone' } },
    { label: 'Email', name: 'email', component: UInput, props: { type: 'email', placeholder: 'you@example.com', icon: 'i-lucide-mail',
    },
    editable: true },
    { label: 'Country', name: 'country', component: UInput, props: { placeholder: 'Your country', icon: 'i-lucide-globe' } },
    { label: 'City', name: 'city', component: UInput, props: { placeholder: 'Your city', icon: 'i-lucide-building-2' } },
    { label: 'Street', name: 'street', component: UInput, props: { placeholder: 'Your street', icon: ui.icons.street } },
    { label: 'Address Line 1', name: 'addressLine1', component: UInput, props: { placeholder: 'Address line 1', icon: 'i-lucide-map' } },
    { label: 'Address Line 2', name: 'addressLine2', component: UInput, props: { placeholder: 'Address line 2', icon: 'i-lucide-map' } },
    { label: 'Address Line 3', name: 'addressLine3', component: UInput, props: { placeholder: 'Address line 3', icon: 'i-lucide-map' } },
    { label: 'Postal Code', name: 'postalCode', component: UInput, props: { placeholder: 'Your postal code', icon: 'i-lucide-credit-card' } },
  ]
}
