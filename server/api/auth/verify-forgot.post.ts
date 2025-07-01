import { z } from 'zod'
// Assuming hubKV, getCookie, createError are available globally or imported

export default defineEventHandler(async event => {
  // Define schema for OTP input validation
  const verifyOtpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits.'), // Assuming 6-digit OTP
  })

  try {
    const body = await readBody(event)
    const parsed = verifyOtpSchema.safeParse(body)

    // --- 1. Input Validation ---
    if (!parsed.success) {
      throw createError({
        statusCode: 400, // Bad Request
        statusMessage: parsed.error.errors.map(err => err.message).join(', '),
      })
    }

    const { otp: receivedOtpString } = parsed.data
    const receivedOtp = Number(receivedOtpString) // Convert to number for comparison

    // --- 2. Retrieve Username from Cookie ---
    // Ensure this cookie name matches what was set in forgot.post.ts
    const username = getCookie(event, 'forgot_username')

    if (!username) {
      throw createError({
        statusCode: 400, // Bad Request or 401 Unauthorized
        statusMessage: 'Password reset session expired or invalid. Please restart the process.',
      })
    }

    // --- 3. Retrieve Stored OTP Data from HubKV ---
    const otpKey = `forgot_password_otp:${username}`
    const storedOtpData = await hubKV().get(otpKey)

    // Check if OTP data exists in KV store
    if (!storedOtpData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired OTP. Please request a new one.',
      })
    }

    const { code: savedOtpCode, createdAt, attempts } = storedOtpData
    const savedOtp = Number(savedOtpCode) // Ensure it's a number

    // --- 4. OTP Expiration and Attempt Limit Checks ---
    const OTP_TTL_SECONDS = 300 // 5 minutes (matches set ttl in forgot.post.ts)
    const MAX_OTP_ATTEMPTS = 5 // Example: Allow 5 attempts

    const otpCreatedAt = new Date(createdAt).getTime() // Convert ISO string back to timestamp
    const now = Date.now()

    if (now - otpCreatedAt > OTP_TTL_SECONDS * 1000) { // Check expiration
      await hubKV().del(otpKey) // Invalidate expired OTP
      throw createError({
        statusCode: 400,
        statusMessage: 'OTP expired. Please request a new one.',
      })
    }

    if (attempts >= MAX_OTP_ATTEMPTS) {
      await hubKV().del(otpKey) // Invalidate OTP after too many attempts
      throw createError({
        statusCode: 403, // Forbidden
        statusMessage: 'Too many OTP attempts. Please request a new OTP.',
      })
    }

    // --- 5. Verify OTP ---
    if (savedOtp !== receivedOtp) {
      // Increment attempt counter for failed OTP
      await hubKV().set(
        otpKey,
        { ...storedOtpData, attempts: attempts + 1 },
        { ttl: OTP_TTL_SECONDS - Math.floor((now - otpCreatedAt) / 1000) } // Keep remaining TTL
      )
      throw createError({
        statusCode: 401, // Unauthorized
        statusMessage: 'Invalid OTP.',
      })
    }

    // --- 6. OTP Verified Successfully ---
    // Clear the OTP from HubKV immediately after successful verification (single-use)
    await hubKV().del(otpKey)

    // Clear the temporary cookies related to forgot password flow
    setCookie(event, 'forgot_username', '', { maxAge: 0, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
    setCookie(event, 'forgot_method', '', { maxAge: 0, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
    setCookie(event, 'forgot_masked_target', '', { maxAge: 0, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })

    // Set a new secure, short-lived, single-use token to allow password reset
    const resetToken = crypto.randomUUID() // Generate a unique reset token
    const resetTokenKey = `reset_token:${username}:${resetToken}` // Key for the reset token
    await hubKV().set(
      resetTokenKey,
      { username: username, used: false }, // Store username and a 'used' flag
      { ttl: 120 } // Token valid for 2 minutes (120 seconds) for immediate use
    )
    // Set this token in a cookie to be used by the /reset.post.ts endpoint
    setCookie(event, 'password_reset_token', resetToken, {
      maxAge: 120, // Max age matches token TTL
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
    setCookie(event, 'reset_username', username, { // Pass username securely to reset page
      maxAge: 120,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })

    return {
      statusCode: 200,
      message: 'OTP verified successfully. You can now reset your password.',
      // Do not return sensitive info like username or email directly here
    }
  }
  catch (error: any) {
    console.error('OTP verification API error:', error)
    const statusCode = error.statusCode || 500
    const statusMessage = error.statusMessage || error.message || 'An unexpected error occurred during OTP verification.'
    throw createError({ statusCode, statusMessage })
  }
})
