const schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),

  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['Password'],
})

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { success, data, error } = schema.safeParse(body)
  if (!success) return { success: false, error: error.errors[0].message }

  const session = await getUserSession(event)
  const userId = (session?.user as User & { id: string }).id

  if (!userId) return { success: false, error: 'Unauthorized' }

  const db = useDb()
  const user = await db.select().from(tables.users).where(eq(tables.users.id, userId)).get()
  if (!user) return { success: false, error: 'User not found' }

  const hashed = await hashPassword(data.password)
  await db.update(tables.users).set({ password: hashed }).where(eq(tables.users.id, userId)).run()

  return { success: true, message: 'Password updated' }
})
