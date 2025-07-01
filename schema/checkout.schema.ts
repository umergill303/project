import { z } from 'zod'

export const schema = z.object({
  name: z.string().min(2, ' Enter Your Name'),
  email: z.string().email('Please enter a valid email'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number too long'),
  address: z.string().min(5, 'Enter Your Address'),
  province: z.string().min(2, 'Province must '),
  country: z.string().min(1, 'Please select a country'),
  city: z.string().min(2, ' Enter Your City'),
  district: z.string().min(2, 'Enter Your District'),
  code: z.string().min(3, 'Enter Your ZIP code '),
  locate: z.string().min(1, 'Please select a location'),
  agree: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
})
