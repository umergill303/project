import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { _timestamps, _uuid } from './_'

export const users = sqliteTable('users', {
  ..._uuid,

  // Authentication Credentials
  email: text('email').unique(),
  username: text('username').notNull().unique(),
  phone: text('phone'),
  password: text('password'),

  // Verification Status
  isPhoneVerified: int('is_phone_verified', { mode: 'boolean' }).default(false),
  isEmailVerified: int('is_email_verified', { mode: 'boolean' }).default(false),

  // Personal Information
  name: text('name').default(''),
  bio: text('bio').default(''),
  avatar: text('avatar').default(''),
  birthday: text('birthday').default(''),
  gender: text('gender').$type<'male' | 'female' | 'other' | 'prefer-not-to-say'>().default('prefer-not-to-say'),

  // Account Status
  status: text('status').$type<'active' | 'suspended' | 'banned'>().default('active'),

  // Social Login
  social: int({ mode: 'boolean' }).default(false),
  socialProvider: text('social_provider'),
  socialId: text('social_id'),

  // Address Info
  country: text().default(''),
  city: text().default(''),
  street: text().default(''),
  postalCode: text('postal_Code').default(''),
  addressLine1: text('address_Line1').default(''),
  addressLine2: text('address_Line2').default(''),
  addressLine3: text('address_Line3').default(''),

  // Roles as JSON Array
  roles: text('roles', { mode: 'json' }).$type<(
  'user' |
  'admin' |
  'staff' |
  'customer_service' |
  'manager' |
  'banned'
  )[]>().default(['user']),

  // Audit Fields
  lastLogin: int('last_login', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  ..._timestamps
})

export const addresses = sqliteTable('addresses', {
  ..._uuid,

  user: text('user').notNull().references(() => users.id, { onDelete: 'cascade' }),

  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'), // Optional
  addressLine3: text('address_line3'), // Optional (e.g., for apartment/suite)
  city: text('city').notNull(),
  state: text('state'), // State/Province/Region (e.g., 'California', 'Punjab')
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),

  addressType: text('address_type').$type<'shipping' | 'billing'>().default('billing'),
  name: text('name').notNull(), // Full name of the person receiving mail/package
  phone: text('phone'), // Phone number for delivery contact

  isDefault: int('is_default', { mode: 'boolean' }).default(false), // True if this is the user's default address

  ..._timestamps
})

export type User = typeof users.$inferSelect
export const NewUser = users.$inferInsert

// export const GenderType = User['gender']
