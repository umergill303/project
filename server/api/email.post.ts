// server/api/email-otp.post.ts

import { z } from 'zod'

export default defineEventHandler(async event => {
  const emailOtpSchema = z.object({
    otp: z.string(),
    email: z.string().email(),
  })

  try {
    const body = await readBody(event)
    const parsed = emailOtpSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsed.error.errors.map(err => err.message).join(', '),
      })
    }

    const { otp, email } = parsed.data

    // TODO: Integrate your actual email sending service here
    // This is where you'd use Nodemailer, SendGrid, Mailgun, etc.
    // Example (conceptual):
    /*
    import nodemailer from 'nodemailer'; // Or your preferred email library

    const transporter = nodemailer.createTransport({
      host: 'your_smtp_host',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'your_email_user',
        pass: 'your_email_pass',
      },
    });

    await transporter.sendMail({
      from: '"Your App Name" <no-reply@yourdomain.com>',
      to: email,
      subject: 'Your Password Reset OTP',
      html: `<p>Your One-Time Password (OTP) for password reset is: <strong>${otp}</strong></p>
             <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>`,
    });
    */

    console.log(`[Email OTP] Sent OTP ${otp} to ${email}`) // For development logging

    return {
      statusCode: 200,
      message: 'Email OTP sent successfully.',
    }
  }
  catch (error: any) {
    console.error('Email OTP sending failed:', error)
    const statusCode = error.statusCode || 500
    const statusMessage = error.statusMessage || error.message || 'Failed to send OTP email.'
    throw createError({ statusCode, statusMessage })
  }
})
