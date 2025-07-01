// export enum LocationType {
//   Home = 'Home',
//   Office = 'Office',
// }

export enum AttributeType {
  Button = 'Button',
  Color = 'Color',
  Image = 'Image',
  Select = 'Select',
  Text = 'Text',
}

export enum GenderType {
  Male = 'Male',
  FeMale = 'FeMale',
  Other = 'Other',
  PreferNotToSay = 'Prefer Not to Say',
}

export const enumOrder = {
  Pending: { status: 'Pending', label: 'Pending', color: 'neutral' },
  Processing: { status: 'Processing', label: 'Processing', color: 'warning' },
  Shipped: { status: 'Shipped', label: 'Shipped', color: 'info' },
  Delivered: { status: 'Delivered', label: 'Delivered', color: 'primary' },
  Canceled: { status: 'Canceled', label: 'Canceled', color: 'error' },
  Returned: { status: 'Returned', label: 'Returned', color: 'error' },
} as const

export type OrderStatus = keyof typeof enumOrder
export type OrderInfo = (typeof enumOrder)[OrderStatus]
export const getOrderStatuses = (): OrderInfo[] => Object.values(enumOrder)

// Create a helper object to map status to color
export const OrderColors = {
  Pending: 'neutral',
  Processing: 'info',
  Shipped: 'warning',
  Delivered: 'primary',
  Canceled: 'error',
  Returned: 'error',
} as const

// Payment
export const enumPayment = {
  paid: { status: 'paid', label: 'Paid', color: 'primary' },
  pending: { status: 'pending', label: 'Pending', color: 'info' },
  failed: { status: 'failed', label: 'Failed', color: 'error' },
  refunded: { status: 'refunded', label: 'Refunded', color: 'error' },
  partially: { status: 'partially', label: 'Partially', color: 'warning' },
} as const
export type PaymentStatus = keyof typeof enumPayment
export type PaymentInfo = (typeof enumPayment)[PaymentStatus]
export const getPaymentStatuses = (): PaymentInfo[] => Object.values(enumPayment)

export enum Role { user = 'user', admin = 'admin' }
export const RoleStatus = () => {
  return Object.values(Role).map(status => ({
    label: status, value: status }))
}

export enum Season {
  all = 'All Season',
  winter = 'Winter',
  summer = 'Summer',
}
export const SeasonStatus = () => {
  return Object.values(Season).map(status => ({
    label: status,
    value: status,
  }))
}
export enum ReturnOrderStatus {
  Requested = 'requested',
  Approved = 'approved',
  Processing = 'processing',
  Shipped = 'shipped',
  Received = 'received',
  Refunded = 'refunded',
  Rejected = 'rejected'
}

export const enumReturnOrder = {
  [ReturnOrderStatus.Requested]: { status: ReturnOrderStatus.Requested, label: 'Requested', color: 'neutral' },
  [ReturnOrderStatus.Approved]: { status: ReturnOrderStatus.Approved, label: 'Approved', color: 'info' },
  [ReturnOrderStatus.Processing]: { status: ReturnOrderStatus.Processing, label: 'Processing', color: 'warning' },
  [ReturnOrderStatus.Shipped]: { status: ReturnOrderStatus.Shipped, label: 'Shipped', color: 'primary' },
  [ReturnOrderStatus.Received]: { status: ReturnOrderStatus.Received, label: 'Received', color: 'success' },
  [ReturnOrderStatus.Refunded]: { status: ReturnOrderStatus.Refunded, label: 'Refunded', color: 'primary' },
  [ReturnOrderStatus.Rejected]: { status: ReturnOrderStatus.Rejected, label: 'Rejected', color: 'error' }
} as const

export type ReturnOrderStatusType = keyof typeof enumReturnOrder
export type ReturnOrderStatusInfo = (typeof enumReturnOrder)[ReturnOrderStatusType]

export const getReturnOrderStatuses = (): ReturnOrderStatusInfo[] => Object.values(enumReturnOrder)
