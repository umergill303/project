import { z } from 'zod' // Assuming Zod is imported or auto-imported

export default defineEventHandler(async event => {
  const changePasswordSchema = z.object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),

    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),

    confirmPassword: z.string(), // Confirmation of new password
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match.',
    path: ['confirmPassword'], // Specifies which field the error applies to
  })

  try {
    const body = await readBody(event)
    const parsed = changePasswordSchema.safeParse(body)
    const session = await getUserSession(event) // Get the user's current session

    // --- 1. Authentication Check ---
    const userId = session?.user?.id
    if (!userId) {
      throw createError({ statusCode: 401, statusMessage: 'User not authenticated. Please log in.' })
    }

    // --- 2. Input Validation (Zod) ---
    if (!parsed.success) {
      throw createError({ statusCode: 400, statusMessage: parsed.error.errors.map(err => err.message).join(', ') })
    }

    const { password, newPassword } = parsed.data
    const db = useDb()

    // --- 3. Fetch User from Database ---
    // Select only necessary fields (password for verification, and id for update)
    const user = await db
      .select({
        id: tables.users.id,
        password: tables.users.password,
      })
      .from(tables.users)
      .where(eq(tables.users.id, userId))
      .get()

    if (!user) {
      // This case should ideally not happen if userId from session is valid
      throw createError({ statusCode: 404, statusMessage: 'User not found.' })
    }

    // --- 4. Verify Current Password ---
    // If the user's password field is null (e.g., social login), they can't change password this way
    if (!user.password) {
      throw createError({ statusCode: 403, statusMessage: 'This account does not have a password. Please use social login or password reset if available.' })
    }

    const isCurrentPasswordCorrect = await verifyPassword(user.password, password)
    if (!isCurrentPasswordCorrect) {
      throw createError({ statusCode: 401, statusMessage: 'Incorrect current password.' })
    }

    // --- 5. Hash the New Password ---
    const hashedPassword = await hashPassword(newPassword)

    // --- 6. Update User's Password in the Database ---
    await db
      .update(tables.users)
      .set({ password: hashedPassword })
      .where(eq(tables.users.id, user.id))
      .run() // .run() is used as no data needs to be returned from the update

    return {
      statusCode: 200, // OK
      message: 'Password changed successfully!',
    }
  }
  catch (err: any) {
    // Log the full error for server-side debugging
    console.error('Change password error:', err)

    // Standardized error response using createError
    const statusCode = err.statusCode || 500
    const statusMessage = err.statusMessage || err.message || 'An unexpected error occurred. Please try again later.'

    throw createError({
      statusCode,
      statusMessage,
    })
  }
})
