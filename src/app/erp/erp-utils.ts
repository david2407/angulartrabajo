import { checkIfValidMongoID } from '../core/utils'

export const filterListAutocomplete = (
  input: string,
  list: any[],
  attrs: string[],
  opts: any = {}
): any[] => {
  if (!input || typeof input !== 'string' || checkIfValidMongoID(input)) {
    if (opts.showIfEmpty) {
      if (opts.disableLimitList) {
        return list
      }
      return list.slice(0, 10)
    }
    return []
  }

  input = input.toLowerCase()
  const filteredList = [
    ...list.filter((item) =>
      attrs.some((attr) => String(item[attr])?.toLowerCase().includes(input))
    ),
  ]

  const limitListLength = input.length < 5
  if (!opts.disableLimitList && limitListLength) {
    return filteredList.slice(0, 10)
  }

  return filteredList
}
