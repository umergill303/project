import { z } from 'zod'
// Assuming Drizzle ORM is used, and `tables.users` and `useDb()` are properly set up

const schema = z.object({
  username: z.string().min(3),
  phoneNumber: z.string().min(10).max(15).regex(/^\d+$/),
  password: z.string().min(8),
})

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0].message }
  }

  const db = useDb()
  const data = parsed.data

  // ✅ Check if username already exists
  const existingUsername = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.username, data.username))
    .then(res => res[0])

  if (existingUsername) {
    return {
      success: false,
      message: 'Username already exists',
    }
  }

  // ✅ Check if phone number already exists
  const existingPhone = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.phone, data.phoneNumber)) // Ensure correct field name
    .then(res => res[0])

  if (existingPhone) {
    return {
      success: false,
      message: 'Phone number already used',
    }
  }

  // ✅ Generate OTP
  const otp = Math.floor(10000 + Math.random() * 90000) // 5-digit OTP

  console.log('Storing user data in HubKV:', data)
  console.log('Generated OTP:', otp)

  // ✅ Store OTP + user data in HubKV (temporary, 5 minutes)
  const otpKey = `otp:${data.phoneNumber}`
  await hubKV().set(
    otpKey,
    {
      code: otp,
      username: data.username,
      phoneNumber: data.phoneNumber,
      password: data.password,
      createdAt: Date.now(),
      attempts: 0,
    },
    { ttl: 300 }
  )

  // ✅ Send OTP using internal /api/sms endpoint
  await $fetch('/api/sms', {
    method: 'POST',
    body: { otp, phone: data.phoneNumber },
  })

  // ✅ Set cookie for phone number
  setCookie(event, 'phoneNumber', data.phoneNumber, { maxAge: 300 })

  return {
    success: true,
    message: 'User data and OTP temporarily stored in HubKV',
  }
})
