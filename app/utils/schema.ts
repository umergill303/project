import { z } from 'zod'

// --- Username Schema ---
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters.')
  .max(20, 'Username must be at most 20 characters.')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.')

// --- Password Schema ---
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.')

// --- Auth: Register ---
export const userRegisterSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
})

// --- Auth: Login ---
export const userLoginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  remember: z.boolean().default(false),
})

// --- Auth: Change Password ---
export const userChangePasswordSchema = z.object({
  password: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

// --- Auth: Forgot Password (Reset) ---
export const userResetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})
