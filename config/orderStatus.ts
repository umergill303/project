export const statusConfig = {
  pending: { label: 'Pending', color: 'warning', allowedNext: ['processing'] },
  processing: { label: 'Processing', color: 'info', allowedNext: ['shipped'] },
  shipped: { label: 'Shipped', color: 'primary', allowedNext: ['delivered'] },
  delivered: { label: 'Delivered', color: 'success', allowedNext: [] },
  canceled: { label: 'Canceled', color: 'error', allowedNext: [] },
  rejected: { label: 'Rejected', color: 'error', allowedNext: [] },
  returned: { label: 'Returned', color: 'secondary', allowedNext: [] }
}
