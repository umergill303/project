export default defineOAuthGoogleEventHandler({
  config: {
    clientId: '510898284695-7iv3e3nkgbchdkl6kvnvh321v2c49uan.apps.googleusercontent.com',
    clientSecret: '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',
  },
  async onSuccess(event, { user }) {
    // Access your Drizzle DB instance
    const db = useDb()

    // Check for necessary Google user data
    if (!user || !user.email) {
      throw createError({ statusCode: 400, statusMessage: 'Google user data (especially email) not found.' })
    }

    let existingUser = null
    const userRoleNames: string[] = [] // To store the roles for the session

    // 1. Try to find the user by their email address
    existingUser = await db.select()
      .from(tables.users)
      .where(eq(tables.users.email, user.email))
      .get()

    if (!existingUser) {
      // --- A. New User Registration via Google ---

      // Ensure 'user' role exists or create it using onConflictDoUpdate

      // Generate a unique username for social login users.
      // This is crucial as 'username' is not null in your schema.
      const generatedUsername = `google_user_${crypto.randomUUID().slice(0, 8)}` // Example: google_user_abcdefgh

      const newUserInsertData: typeof tables.users.$inferInsert = {
        username: generatedUsername, // Assign the unique generated username
        email: user.email, // Google email
        password: null, // No password for social login
        phone: null, // No phone initially
        name: user.name || null, // Google name
        avatar: user.picture || null, // Google profile picture
        status: 'active', // Set as active
        isPhoneVerified: false,
        social: true, // Mark as social login
        socialProvider: 'google', // Social provider
        roles: ['user'] // Phone not verified
        // socialProvider and socialId would ideally be stored in a separate 'accounts' table for robust linking
        // For now, if you are not tracking socialProvider/socialId on the users table, skip them here.
      }

      const createdUserRecords = await db.insert(tables.users)
        .values(newUserInsertData)
        .returning({
          id: tables.users.id,
          username: tables.users.username,
          email: tables.users.email,
          name: tables.users.name,
          status: tables.users.status,
          phone: tables.users.phone, // Include phone
          avatar: tables.users.avatar, // Include avatar
        })

      existingUser = createdUserRecords[0]

      // Assign the default 'user' role to the newly created user
      // Only 'user' role assigned
    }
    else {
      // --- B. Existing User Login via Google ---

      // Optional: Update user's name/avatar/lastLogin if they might have changed on Google
      await db.update(tables.users)
        .set({
          name: user.name || existingUser.name,
          avatar: user.picture || existingUser.avatar,
          socialProvider: 'google', // If you were storing this directly on users table
          socialId: user.id, // If you were storing this directly on users table
        })
        .where(eq(tables.users.id, existingUser.id))

      // Fetch all roles for the authenticated user from user_roles and roles tables
    }

    // --- Set User Session ---
    // Ensure all necessary user data (including roles) is in the session
    const userSessionData = {
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email || null,
      phone: existingUser.phone || null,
      name: existingUser.name || null,
      status: existingUser.status,
      avatar: existingUser.avatar || null,
      roles: userRoleNames, // Array of role names
      active: existingUser.status === 'active', // Derived active status
    }

    await replaceUserSession(event, {
      user: userSessionData,
      loggedInAt: Date.now(),
    }, { maxAge: 2147483647 }) // Long-lived session

    // Redirect to the desired page after successful login
    return sendRedirect(event, '/')
  },
  async onError(event, error) {
    console.error('Google OAuth Error:', error)
    // Redirect to a login error page or show a generic error message
    throw createError({
      statusCode: 500,
      statusMessage: 'Google login failed. Please try again.',
      data: error.message, // Pass the error message for debugging if needed
    })
    // return sendRedirect(event, '/login?error=oauth_failed'); // Alternative redirect for error
  },
})
