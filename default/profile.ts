import type { User } from '~~/server/database/schema'

export const defaultProfile: Omit<User, 'id'> = {
  name: '',
  email: '',
  phone: '',
  birthday: '',
  country: '',
  city: '',
  street: '',
  postalCode: '',
  gender: null,
  addressLine1: '',
  addressLine2: '',
  addressLine3: '',
  username: '',
  bio: '',
  avatar: '',
  password: '',
  createdAt: null,
  lastLogin: null,
  active: false,
  status: null,
  done: false,
  role: '',
  social: false
} as const
