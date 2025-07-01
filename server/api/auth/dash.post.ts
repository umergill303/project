export default defineEventHandler(async event => {
  const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string(),
  })

  try {
    const body = await readBody(event)
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map(err => err.message).join(', '),
      }
    }
    const { email, password } = parsed.data
    const user = await useDb()
      .select()
      .from(tables.users)
      .where(eq(tables.users.email, email))
      .get()
    if (!user) {
      return {
        success: false,
        error: 'Email or password is incorrect',
      }
    }
    const isPass = await verifyPassword(user.password, password)
    if (!isPass) {
      return {
        success: false,
        error: 'Email or password is incorrect',
      }
    }
    await setUserSession(event, {
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
        role: user.role,
      },
    })
    return {
      success: true,
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
        role: user.role,
      },
    }
  }
  catch (err) {
    console.error(err)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    }
  }
})
