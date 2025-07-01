import { z } from 'zod'

export const schema = z.object({
  name: z.string().min(2, { message: 'Enter your name (min 2 characters)' }),
  phone: z.number().min(6, { message: 'Phone number is required' }),
  subject: z.string().min(2, { message: 'Subject is required' }),
  message: z.string().min(5, { message: 'Message must be at least 5 characters' }),
})
