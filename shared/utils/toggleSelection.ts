export const toggleSelection = (id: string, value: boolean, selectionSet: Set<string>) => {
  if (value) {
    selectionSet.add(id)
  }
  else {
    selectionSet.delete(id)
  }
}

export const toggleAllSelection
 = <T extends { id?: string }>(value: boolean | 'indeterminate', items: T[]): Set<string> => {
   if (value === true) {
     return new Set(items.map(p => p.id!).filter(Boolean))
   }
   else {
     return new Set()
   }
 }
