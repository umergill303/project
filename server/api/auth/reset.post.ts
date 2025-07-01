// server/api/auth/reset.post.ts
import { z } from 'zod'

// Define schema for password reset input validation
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters long.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'], // Specifies which field the error message belongs to
})

export default defineEventHandler(async event => {
  try {
    // 1. Read and validate request body
    const body = await readBody(event)
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.errors.map(err => err.message).join(', '),
      })
    }

    const { newPassword } = parsed.data
    const db = useDb()

    // 2. Get reset token and username from cookies (set by verify-forgot.post.ts)
    const resetToken = getCookie(event, 'password_reset_token')
    const username = getCookie(event, 'reset_username')

    if (!resetToken || !username) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Password reset session expired or invalid. Please restart the forgot password process.',
      })
    }

    // 3. Verify the reset token in HubKV
    const tokenKey = `reset_token:${username}:${resetToken}`
    const tokenData = await hubKV().get(tokenKey)

    if (!tokenData || tokenData.used) { // Check if token exists and hasn't been used
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or already used password reset token. Please restart the forgot password process.',
      })
    }

    // Mark the token as used immediately to prevent replay attacks
    await hubKV().set(tokenKey, { ...tokenData, used: true }, { ttl: 60 }) // Keep for a short period to track usage

    // 4. Hash the new password
    const hashedPassword = await hashPassword(newPassword) // 10 is a good default salt rounds

    // 5. Update user's password in the database
    const result = await db
      .update(tables.users)
      .set({
        password: hashedPassword,
      })
      .where(eq(tables.users.username, username))
      .run() // Use .run() for update/insert/delete operations

    if (result.rowsAffected === 0) {
      // This case should ideally not happen if username from token is valid,
      // but it's a good safeguard for data integrity issues.
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update password. User not found or no changes made.',
      })
    }

    // 6. Clear password reset cookies
    setCookie(event, 'password_reset_token', '', { maxAge: 0, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
    setCookie(event, 'reset_username', '', { maxAge: 0, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })

    // 7. Return success response
    return {
      statusCode: 200,
      message: 'Your password has been successfully reset. You can now log in with your new password.',
    }
  }
  catch (error: any) {
    console.error('Password reset API error:', error)
    const statusCode = error.statusCode || 500
    const statusMessage = error.statusMessage || error.message || 'An unexpected error occurred during password reset.'
    throw createError({ statusCode, statusMessage })
  }
})
