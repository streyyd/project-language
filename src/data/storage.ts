export class StorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'StorageError'
  }
}

export function readStorageValue<T>(
  key: string,
  parse: (value: unknown) => T,
): T | null {
  try {
    const rawValue = window.localStorage.getItem(key)

    if (rawValue === null) {
      return null
    }

    return parse(JSON.parse(rawValue))
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }

    throw new StorageError('Unable to read saved data.', { cause: error })
  }
}

export function writeStorageValue<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    throw new StorageError('Unable to save data.', { cause: error })
  }
}
