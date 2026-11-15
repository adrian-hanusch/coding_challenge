/** Reads a JSON value written by the mock. Missing or corrupt entries count as absent. */
export function readJson(storage: Storage, key: string): unknown {
  try {
    return JSON.parse(storage.getItem(key) ?? 'null')
  } catch {
    return null
  }
}
