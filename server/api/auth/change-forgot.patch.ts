import { z } from 'zod'

const schema = z
  .object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),

    confirmPassword: z.string(),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // better UX to highlight the confirm field
  })

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { success, data, error } = schema.safeParse(body)

  if (!success) {
    return { success: false, error: error.errors[0].message }
  }

  const username = getCookie(event, 'username')

  console.log('Changing password for phone number:', username)
  console.log('Received password:', data.password)
  console.log('Received confirm password:', data.confirmPassword)

  if (!username) {
    return { success: false, error: 'Unauthorized: Missing phone number' }
  }

  const db = useDb()

  // ✅ Match user by phone number
  const user = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.username, username))
    .then(res => res[0])

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  const hashed = await hashPassword(data.password)

  // ✅ Update password using the matched user's ID
  await db
    .update(tables.users)
    .set({ password: hashed })
    .where(eq(tables.users.id, user.id))
    .run()

  return { success: true, message: 'Password updated' }
})
