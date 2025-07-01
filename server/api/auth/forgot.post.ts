import { z } from 'zod'
import { eq } from 'drizzle-orm'
// Assuming tables, useDb, hubKV, setCookie, $fetch are available globally or imported

export default defineEventHandler(async event => {
  // Define schema for input validation
  const forgotPasswordSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters.'),
  })

  try {
    // Read and validate request body
    const body = await readBody(event)
    const parsed = forgotPasswordSchema.safeParse(body)

    // --- 1. Input Validation ---
    if (!parsed.success) {
      throw createError({
        statusCode: 400, // Bad Request
        statusMessage: parsed.error.errors.map(err => err.message).join(', '),
      })
    }

    const { username } = parsed.data
    const db = useDb()

    // --- 2. Fetch User from Database to get phone and email ---
    const user = await db
      .select({
        id: tables.users.id,
        phone: tables.users.phone,
        email: tables.users.email,
      })
      .from(tables.users)
      .where(eq(tables.users.username, username))
      .get()

    // --- 3. Determine OTP delivery method and target ---
    let otpMethod: 'phone' | 'email' | 'none' = 'none'
    let otpTarget: string | null = null // Stores the actual phone/email
    let maskedOtpTarget: string | null = null // Stores the masked version for display

    if (user) { // If user exists
      if (user.phone) {
        otpMethod = 'phone'
        otpTarget = user.phone
        // Mask phone number: e.g., +XX XXX XXXX X89
        maskedOtpTarget = `${otpTarget.slice(0, 3)} XXX XXXX ${otpTarget.slice(-3)}`
      }
      else if (user.email) {
        otpMethod = 'email'
        otpTarget = user.email
        // Mask email: e.g., e****@example.com
        const atIndex = otpTarget.indexOf('@')
        if (atIndex > 1) {
          maskedOtpTarget = `${otpTarget.charAt(0)}${'*'.repeat(atIndex - 1)}${otpTarget.slice(atIndex)}`
        }
        else {
          maskedOtpTarget = otpTarget // Fallback for short/invalid emails
        }
      }
    }

    // --- 4. Handle OTP Generation and Sending based on method ---
    if (otpMethod !== 'none' && otpTarget) {
      const otp = Math.floor(100000 + Math.random() * 900000) // Generates a 6-digit OTP
      console.log('otp', otp)

      // --- Store OTP in HubKV ---
      const otpKey = `forgot_password_otp:${username}` // Specific key for forgot password OTPs
      await hubKV().set(
        otpKey,
        {
          code: otp,
          username: username,
          method: otpMethod, // Store how the OTP was sent
          target: otpTarget, // Store the actual target for verification later
          createdAt: new Date().toISOString(),
          attempts: 0,
        },
        { ttl: 300 } // TTL of 5 minutes (300 seconds)
      )

      // --- Send OTP ---
      if (otpMethod === 'phone') {
        await $fetch('/api/sms', {
          method: 'POST',
          body: { otp: otp.toString(), phone: otpTarget },
        })
      }
      else if (otpMethod === 'email') {
        await $fetch('/api/email', { // Call the new email OTP endpoint
          method: 'POST',
          body: { otp: otp.toString(), email: otpTarget },
        })
      }
    }

    // --- 5. Set Cookies for Next Step (Verify OTP) ---
    // These cookies guide the 'verify-forgot.vue' page
    setCookie(event, 'forgot_username', username, {
      maxAge: 300,
      httpOnly: true,
      sameSite: 'strict',
      secure: !import.meta.dev,
    })

    setCookie(event, 'forgot_method', otpMethod, { // e.g., 'phone', 'email', 'none'
      maxAge: 300,
      httpOnly: true,
      sameSite: 'strict',
      secure: !import.meta.dev,
    })

    setCookie(event, 'forgot_masked_target', maskedOtpTarget || 'N/A', { // e.g., '+XX XXXX XXXX X89'
      maxAge: 300,
      httpOnly: true,
      sameSite: 'strict',
      secure: !import.meta.dev,
    })

    // --- 6. Return Generic Success Response for Security ---
    // This prevents username enumeration (attacker can't tell if user/email/phone exists)
    return {
      statusCode: 200,
      message: 'OTP has been sent to the associated contact method.',
    }
  }
  catch (error: any) {
    console.error('Forgot password API error:', error)
    const statusCode = error.statusCode || 500
    const statusMessage = error.statusMessage || error.message || 'An unexpected error occurred. Please try again later.'
    throw createError({ statusCode, statusMessage })
  }
})
