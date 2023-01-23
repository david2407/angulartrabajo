export interface TableColumnType {
  default: boolean
  name: string
  label: string
}

export interface ErpFilter {
  title: string
  name: string
  fieldType: string
  interface?: string
  inputInserted?:string
  model?: any
  default?: any
  opts?: any
  optTitle?: string
  optValue?: string
  access?: () => boolean
  active?: boolean
}
