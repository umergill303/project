// server/api/auth/get-forgot-info.get.ts

// The defineEventHandler is usually auto-imported in Nuxt 3 API routes.
// If you face issues, you might explicitly import it:
// import { defineEventHandler, getCookie, createError } from 'h3';

export default defineEventHandler(async event => {
  try {
    // Read the httpOnly cookies which were set by forgot.post.ts
    const username = getCookie(event, 'forgot_username')
    const method = getCookie(event, 'forgot_method')
    const maskedTarget = getCookie(event, 'forgot_masked_target')

    // If any essential cookie is missing, it means the flow is not valid or expired
    if (!username || !method || !maskedTarget) {
      throw createError({
        statusCode: 400, // Bad Request or 401 Unauthorized, depending on strictness
        statusMessage: 'Password reset session expired or invalid. Please restart the forgot password process.',
      })
    }

    // Return the information securely
    return {
      statusCode: 200,
      username: username, // Return username for potential future client-side reference
      method: method, // 'phone' or 'email'
      maskedTarget: maskedTarget, // e.g., '+XX XXXX XXXX X89' or 'e****@example.com'
    }
  }
  catch (error: any) {
    console.error('Error fetching forgot info:', error)
    const statusCode = error.statusCode || 500
    const statusMessage = error.statusMessage || error.message || 'Failed to retrieve reset information.'
    throw createError({ statusCode, statusMessage })
  }
})
