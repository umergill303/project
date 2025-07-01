// server/api/sms.post.ts
import twilioClient from 'twilio' // Renamed to avoid conflict with `twilio` constant from runtimeConfig
import { z } from 'zod'

export default defineEventHandler(async event => {
  const smsSchema = z.object({
    otp: z.string().min(4, 'OTP must be at least 4 digits.').max(6, 'OTP must be at most 6 digits.'),
    phone: z.string().min(7, 'Phone number is too short.').max(15, 'Phone number is too long.'),
  })

  try {
    const body = await readBody(event)
    const parsed = smsSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.errors.map(err => err.message).join(', '),
      })
    }

    const { otp, phone } = parsed.data

    const { twilio } = useRuntimeConfig() // Access the twilio object from runtimeConfig

    // --- TEMPORARY DEBUGGING LOGS ---
    console.log('--- Twilio Runtime Config Debug ---')
    console.log('Account SID:', twilio?.accountSid ? 'Loaded' : 'MISSING')
    console.log('Auth Token:', twilio?.authToken ? 'Loaded' : 'MISSING')
    console.log('Twilio Phone Number (From):', twilio?.phoneNumber) // Check this value!
    console.log('--- End Twilio Runtime Config Debug ---')
    // --- END TEMPORARY DEBUGGING LOGS ---

    if (!twilio || !twilio.accountSid || !twilio.authToken || !twilio.phoneNumber) {
      console.error('Twilio configuration missing in runtimeConfig.')
      throw createError({
        statusCode: 500,
        statusMessage: 'SMS service is not configured. Please contact support.',
      })
    }

    const client = twilioClient(twilio.accountSid, twilio.authToken) // Use twilioClient here

    const message = await client.messages.create({
      from: twilio.phoneNumber, // Use the property directly from the twilio object
      to: phone,
      body: `Your verification code is: ${otp}`
    })

    console.info(`SMS sent successfully to ${phone}. SID: ${message.sid}`)

    return {
      statusCode: 200,
      message: 'SMS sent successfully.',
    }
  }
  catch (err: any) {
    console.error('SMS sending error:', err)
    const statusCode = err.statusCode || 500
    const statusMessage = err.message || 'Failed to send SMS. Please check the phone number or try again later.'
    throw createError({ statusCode, statusMessage })
  }
})
