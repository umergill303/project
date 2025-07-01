import twilio from 'twilio'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { phone } = body
  console.log('Phone************************:', phone) // debug log
  const { accountSid, authToken, phoneNumber } = useRuntimeConfig().twilio

  // console.log('OTP:', otp)
  const about = await $fetch('/api/about')

  const client = twilio(accountSid, authToken)
  try {
    const message = await client.messages.create({
      from: about.contactPhone,
      to: phone, // Send the formatted phone number
      body: `Your Order Successfully Placed. Thank you for shopping with us!`,
    })

    console.log('SMS sent:', message.sid)
    return { success: true }
  }
  catch (err) {
    console.error('SMS Error:', err)
    return { success: false, error: err.message }
  }
})
