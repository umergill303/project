export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const body = await readBody(event)
    const {
      username, name, email, phone, birthday, country, city,
      street, postalCode, gender, addressLine1, addressLine2, addressLine3,
    } = body
    const session = await getUserSession(event)
    const userId = (session?.user as User & { id: string })?.id

    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized: User not logged in' })
    }

    // Get current user data first
    const currentUser = await db.query.users.findFirst({
      where: eq(tables.users.id, userId)
    })

    if (!currentUser) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    // Validation checks
    if (username && username !== currentUser.username) {
      const existingUsername = await db.query.users.findFirst({
        where: and(
          eq(tables.users.username, username),
          ne(tables.users.id, userId)
        )
      })
      if (existingUsername) {
        return {
          success: false,
          available: false,
          message: 'Username already in use',
          field: 'username'
        }
      }
    }

    if (email && email !== currentUser.email) {
      const existingEmail = await db.query.users.findFirst({
        where: and(
          eq(tables.users.email, email),
          ne(tables.users.id, userId)
        )
      })
      if (existingEmail) {
        return {
          success: false,
          available: false,
          message: 'Email already in use',
          field: 'email'
        }
      }
    }

    if (phone && phone !== currentUser.phone) {
      const existingPhone = await db.query.users.findFirst({
        where: and(
          eq(tables.users.phone, phone),
          ne(tables.users.id, userId)
        )
      })
      if (existingPhone) {
        return {
          success: false,
          available: false,
          message: 'Phone number already in use',
          field: 'phone'
        }
      }
    }

    // Proceed with update
    const result = await db
      .update(tables.users)
      .set({
        username,
        name,
        email,
        phone: phone || null,
        birthday,
        country,
        city,
        street,
        postalCode,
        addressLine1,
        addressLine2,
        addressLine3,
        gender,
      })
      .where(eq(tables.users.id, userId))
      .returning()

    return {
      success: true,
      available: true,
      message: 'Profile updated successfully',
      data: result[0]
    }
  }
  catch (error: any) {
    console.error('Error updating profile:', error)
    return {
      success: false,
      available: false,
      message: error.message || 'Failed to update profile',
      ...(error.data?.field && { field: error.data.field })
    }
  }
})
