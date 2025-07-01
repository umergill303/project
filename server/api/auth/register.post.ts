import { userRegisterSchema } from '~/utils/schema'

export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const body = await readBody(event)
    const parsed = userRegisterSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0].message })
    }
    const { username, password } = parsed.data

    // --- 1. Input Validation ---
    if (!username || username.length < 3) {
      throw createError({ statusCode: 400, statusMessage: 'Username must be at least 3 characters long.' })
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      throw createError({ statusCode: 400, statusMessage: 'Username can only contain letters, numbers, and underscores.' })
    }

    if (!password || password.length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters long.' })
    }

    // Optional: Enforce stronger passwords (at least 1 number and symbol)
    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/
    if (!strongPasswordRegex.test(password)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must contain at least one letter, one number, and one special character.',
      })
    }

    // --- 2. Check for Existing User ---
    const existingUser = await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.username, username))
      .limit(1)

    if (existingUser.length > 0) {
      throw createError({ statusCode: 409, statusMessage: 'A user with this username already exists.' })
    }

    // --- 3. Hash Password ---
    const hashedPassword = await hashPassword(password)

    // --- 4. Create New User ---
    const user = await db
      .insert(tables.users)
      .values({
        username,
        password: hashedPassword,
      })
      .returning({
        id: tables.users.id,
        username: tables.users.username,
        roles: tables.users.roles,
      })
      .get()

    // --- 5. Set User Session ---
    const userSession = {
      user,
      loggedInAt: Date.now(),
    }

    await replaceUserSession(event, userSession, { maxAge: 2147483647 }) // ~68 years

    // --- 6. Return Success Response ---
    return {
      statusCode: 201,
      message: 'Account successfully created! You are now logged in.',
      user: {
        username: user.username,
        roles: user.roles,
      },
    }
  }
  catch (err) {
    console.error('Registration error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal server error.',
    })
  }
})
