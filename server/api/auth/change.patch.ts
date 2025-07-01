const schema = z.object({
  password: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(d => d.newPassword !== d.password, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
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

  const isValid = await verifyPassword(user.password, data.password)
  if (!isValid) return { success: false, error: 'Incorrect current password' }

  const hashed = await hashPassword(data.newPassword)
  await db.update(tables.users).set({ password: hashed }).where(eq(tables.users.id, userId)).run()

  return { success: true, message: 'Password updated' }
})
