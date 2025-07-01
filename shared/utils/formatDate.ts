export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
