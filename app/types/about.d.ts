export interface CurrencyOption {
  label: string
  value: {
    code: string
    symbol: string
  }
}

export interface KeyItem {
  key: string
  label: string
  component: string
  type?: string
  step?: string
  options?: CurrencyOption[]
  description?: string
}

export interface AboutSection {
  title: string
  description: string
  icon: string
  iconColor: string
  keys: KeyItem[]
}
