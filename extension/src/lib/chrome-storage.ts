/**
 * Chrome Storage Utility
 * Provides convenient methods to work with Chrome extension storage
 */

export interface StorageData {
  [key: string]: any;
}

export class ChromeStorage {
  /**
   * Get data from Chrome storage
   * @param keys - String key, array of keys, or null for all data
   * @param area - Storage area ('sync' or 'local')
   */
  static async get<T = any>(
    keys?: string | string[] | null,
    area: 'sync' | 'local' = 'local'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage) {
        reject(new Error('Chrome storage API not available'));
        return;
      }

      chrome.storage[area].get(keys || null, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result as T);
        }
      });
    });
  }

  /**
   * Set data in Chrome storage
   * @param data - Object with key-value pairs to store
   * @param area - Storage area ('sync' or 'local')
   */
  static async set(
    data: StorageData,
    area: 'sync' | 'local' = 'local'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage) {
        reject(new Error('Chrome storage API not available'));
        return;
      }

      chrome.storage[area].set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Remove data from Chrome storage
   * @param keys - String key or array of keys to remove
   * @param area - Storage area ('sync' or 'local')
   */
  static async remove(
    keys: string | string[],
    area: 'sync' | 'local' = 'local'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage) {
        reject(new Error('Chrome storage API not available'));
        return;
      }

      chrome.storage[area].remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Clear all data from Chrome storage
   * @param area - Storage area ('sync' or 'local')
   */
  static async clear(area: 'sync' | 'local' = 'local'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage) {
        reject(new Error('Chrome storage API not available'));
        return;
      }

      chrome.storage[area].clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get storage usage information
   * @param area - Storage area ('sync' or 'local')
   */
  static async getBytesInUse(
    keys?: string | string[] | null,
    area: 'sync' | 'local' = 'local'
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage) {
        reject(new Error('Chrome storage API not available'));
        return;
      }

      chrome.storage[area].getBytesInUse(keys || null, (bytesInUse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(bytesInUse);
        }
      });
    });
  }

  /**
   * Listen for storage changes
   * @param callback - Function to call when storage changes
   * @param area - Storage area to listen to ('sync', 'local', or null for all)
   */
  static addChangeListener(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void,
    area?: 'sync' | 'local'
  ): void {
    if (!chrome?.storage) {
      throw new Error('Chrome storage API not available');
    }

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (!area || areaName === area) {
        callback(changes, areaName);
      }
    };

    chrome.storage.onChanged.addListener(listener);
  }

  /**
   * Remove storage change listener
   * @param callback - The callback function to remove
   */
  static removeChangeListener(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void
  ): void {
    if (!chrome?.storage) {
      throw new Error('Chrome storage API not available');
    }

    chrome.storage.onChanged.removeListener(callback);
  }
}

// Convenience functions for common operations
export const chromeStorage = {
  // Local storage shortcuts
  local: {
    get: <T = any>(keys?: string | string[] | null) => ChromeStorage.get<T>(keys, 'local'),
    set: (data: StorageData) => ChromeStorage.set(data, 'local'),
    remove: (keys: string | string[]) => ChromeStorage.remove(keys, 'local'),
    clear: () => ChromeStorage.clear('local'),
    getBytesInUse: (keys?: string | string[] | null) => ChromeStorage.getBytesInUse(keys, 'local'),
  },
  
  // Sync storage shortcuts
  sync: {
    get: <T = any>(keys?: string | string[] | null) => ChromeStorage.get<T>(keys, 'sync'),
    set: (data: StorageData) => ChromeStorage.set(data, 'sync'),
    remove: (keys: string | string[]) => ChromeStorage.remove(keys, 'sync'),
    clear: () => ChromeStorage.clear('sync'),
    getBytesInUse: (keys?: string | string[] | null) => ChromeStorage.getBytesInUse(keys, 'sync'),
  },
  
  // Change listeners
  addChangeListener: ChromeStorage.addChangeListener,
  removeChangeListener: ChromeStorage.removeChangeListener,
};

export default chromeStorage;