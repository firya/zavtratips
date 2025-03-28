export const hostNameMap: Record<string, string> = {
  'dima': 'Дима',
  'timur': 'Тимур',
  'maksim': 'Максим',
}

export const isMainHost = (host: string): boolean => {
  return host in hostNameMap
} 