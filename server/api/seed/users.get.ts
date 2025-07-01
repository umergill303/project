// server/api/seed/users.get.ts

// 'eq' is not used in this specific file, so we'll remove its import.
// 'event' is not used, as we're not reading body or params from it.

// Assuming 'tables' object (containing tables.users, tables.roles, tables.userRoles)
// and 'hashPassword' are both auto-imported and available globally.

export default defineEventHandler(async () => { // 'event' removed as it's not used
  // --- CRITICAL SECURITY CHECK ---
  // This endpoint is for DEVELOPMENT ONLY. NEVER deploy to production.
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Seeding endpoint is not available in production.',
    })
  }
  // --- END SECURITY CHECK ---

  const db = useDb() // Access your Drizzle database instance

  try {
    // --- 1. Clear Existing Data for a Clean Slate ---
    console.log('Clearing existing user, role, and user role data for fresh seed...')
    await db.delete(tables.users)
    console.log('Existing data cleared.')

    // --- 2. Seed Core Roles ---
    console.log('Seeding predefined roles (admin, moderator, customer)...')

    // --- 3. Generate and Seed 10 Users with Hashed Passwords and Specific Roles ---
    console.log('Generating and seeding 10 users with specific roles...')

    const avatars = [
      'https://i.pravatar.cc/150?img=1', 'https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3',
      'https://i.pravatar.cc/150?img=4', 'https://i.pravatar.cc/150?img=5', 'https://i.pravatar.cc/150?img=6',
      'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8', 'https://i.pravatar.cc/150?img=9',
      'https://i.pravatar.cc/150?img=10'
    ]

    for (let i = 1; i <= 10; i++) {
      const username = `user${i}`
      const email = `${username}@example.com`
      const password = `${username}Pass!` // Unique password for each user
      const hashedPassword = await hashPassword(password)
      const userId = crypto.randomUUID() // Generate ID here for direct use

      await db.insert(tables.users).values({
        id: userId,
        username: username,
        email: email,
        password: hashedPassword,
        name: `Test user ${i}`,
        phone: `+923${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        isEmailVerified: true,
        isPhoneVerified: true,
        gender: i % 2 === 0 ? 'Female' : 'Male' as const, // Alternate gender
        country: 'Pakistan',
        city: i % 3 === 0 ? 'Lahore' : (i % 3 === 1 ? 'Karachi' : 'Islamabad'),
        status: 'active' as const,
        bio: `Bio for ${username}.`,
        avatar: avatars[i],
        roles: ['user']
      })
    }
    for (let i = 1; i <= 10; i++) {
      const username = `admin${i}`
      const email = `${username}@example.com`
      const password = `${username}Pass!` // Unique password for each user
      const hashedPassword = await hashPassword(password)
      const userId = crypto.randomUUID() // Generate ID here for direct use

      await db.insert(tables.users).values({
        id: userId,
        username: username,
        email: email,
        password: hashedPassword,
        name: `Test admin ${i}`,
        phone: `+923${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        isEmailVerified: true,
        isPhoneVerified: true,
        gender: i % 2 === 0 ? 'Female' : 'Male' as const, // Alternate gender
        country: 'Pakistan',
        city: i % 3 === 0 ? 'Lahore' : (i % 3 === 1 ? 'Karachi' : 'Islamabad'),
        status: 'active' as const,
        bio: `Bio for ${username}.`,
        avatar: avatars[i],
        roles: ['admin']
      })
    }

    return {
      statusCode: 200,
      message: `Database seeded successfully with users and roles.`,
    }
  }
  catch (error: any) {
    console.error('Error seeding database:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to seed data: ${error.message || 'Unknown seeding error'}`,
    })
  }
})
