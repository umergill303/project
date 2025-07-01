// server/api/auth/get-reset-session-status.get.ts

export default defineEventHandler(async event => {
  try {
    const resetToken = getCookie(event, 'password_reset_token')
    const username = getCookie(event, 'reset_username')

    if (!resetToken || !username) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No active password reset session found.',
      })
    }

    // Optionally, you could also check if the token exists in HubKV and isn't used
    // This makes the check even more robust.
    const tokenKey = `reset_token:${username}:${resetToken}`
    const tokenData = await hubKV().get(tokenKey)

    if (!tokenData || tokenData.used) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Password reset session invalid or already used.',
      })
    }

    return {
      statusCode: 200,
      message: 'Reset session is active.',
    }
  }
  catch (error: any) {
    console.error('Error checking reset session status:', error)
    const statusCode = error.statusCode || 500
    const statusMessage = error.statusMessage || error.message || 'Failed to verify reset session.'
    throw createError({ statusCode, statusMessage })
  }
})
