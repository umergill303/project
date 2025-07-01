import { userLoginSchema } from '~/utils/schema'

export default defineEventHandler(async event => {
  // Define schema for validation

  try {
    // Read and validate request body
    const body = await readBody(event)
    const parsed = userLoginSchema.safeParse(body)

    if (!parsed.success) {
      // Use createError for consistent error handling and proper HTTP status codes
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.errors.map(err => err.message).join(', '),
      })
    }

    const { username, password, remember } = parsed.data
    const db = useDb()

    // 1. Find user by username
    const user = await db
      .select({
        id: tables.users.id,
        username: tables.users.username,
        password: tables.users.password,
        phone: tables.users.phone,
        email: tables.users.email,
        name: tables.users.name,
        status: tables.users.status,
        active: tables.users.status,
        avatar: tables.users.avatar,
        social: tables.users.social,
        socialProvider: tables.users.socialProvider,
        socialId: tables.users.socialId,
        roles: tables.users.roles,
      })
      .from(tables.users)
      .where(eq(tables.users.username, username))
      .get()

    if (!user) {
      throw createError({
        statusCode: 401, // Unauthorized
        statusMessage: 'Invalid username or password.',
      })
    }

    // 2. Verify password
    if (!user.password) {
      // This account doesn't have a password (e.g., social login user)
      throw createError({
        statusCode: 401,
        statusMessage: 'This account does not have a password set. Please log in via social provider or reset your password if applicable.',
      })
    }

    const isPasswordValid = await verifyPassword(user.password, password)
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid username or password.',
      })
    }

    const sessionConfig = {
      maxAge: remember ? 2147483647 : undefined, // Long session for "remember me"
    }

    // 5. Set user session
    // Using replaceUserSession is generally preferred when updating or setting a new session after authentication.
    await replaceUserSession(event, { user, loggedInAt: new Date() }, sessionConfig)

    // 6. Return success response
    return {
      statusCode: 200, // OK
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
      },
    }
  }
  catch (error: any) {
    // Log the full error for debugging on the server side
    console.error('Login error:', error)

    // Re-throw the error, allowing Nuxt/Nitro to handle it and send appropriate status code/message
    // If it's an H3Error (from createError), keep its status/message. Otherwise, default to 500.
    const statusCode = error.statusCode || 500
    const statusMessage = error.statusMessage || error.message || 'An unexpected error occurred. Please try again later.'

    throw createError({
      statusCode,
      statusMessage,
    })
  }
})
