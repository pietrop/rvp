interface ICache {
  cache<T>(key: string, data: T): Promise<T>
  clearAll(): Promise<void>
  isCached(keys: string[]): Promise<boolean>
  getCached<T>(key: string): Promise<T>
}

export default ICache
