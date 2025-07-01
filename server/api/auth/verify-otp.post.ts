export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { otp } = body
  const phoneNumber = getCookie(event, 'phoneNumber')

  console.log('Verifying OTP for phone number:', phoneNumber)
  console.log('Received OTP:', otp)

  const res = await hubKV().get(`otp:${phoneNumber}`)
  console.log('Stored OTP data:', res)

  const receivedOtp = Number(otp)
  const savedOtp = Number(res?.code)

  if (!savedOtp || savedOtp !== receivedOtp) {
    return { success: false, message: 'OTP verification failed' }
  }
  const db = useDb()
  const hashed = await hashPassword(res?.password)

  // Attempt to insert the user
  const userRes = await db
    .insert(tables.users)
    .values({ username: res?.username, phone: res?.phoneNumber, password: hashed })
    .returning({ id: tables.users.id })

  if (!userRes || userRes.length === 0) {
    throw new Error('User creation failed.')
  }
  const userId = userRes[0].id
  console.log('New User ID:', userId)

  // Create a cart for the user
  const cartRes = await db
    .insert(tables.carts)
    .values({ user: userId })
    .returning({ id: tables.carts.id })

  console.log('Cart Created:', cartRes)
  return {
    success: true,
    message: 'OTP verified and user created'
  }
})
