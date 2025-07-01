export { z } from 'zod'

export const isString = (value: any): value is string => typeof value === 'string'
export const isBoolean = (value: any): value is boolean => typeof value === 'boolean'
export const isObject = (value: any): value is Record<string, any> => value !== null && typeof value === 'object' && !Array.isArray(value)
export const isArray = (value: any): value is any[] => Array.isArray(value)
