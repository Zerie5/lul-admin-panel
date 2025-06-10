// Secure storage utility for sensitive data
// This provides additional security layers for token storage

interface SecureStorageOptions {
  encrypt?: boolean;
  expiry?: number; // in milliseconds
}

class SecureStorage {
  private static instance: SecureStorage;
  private readonly prefix = 'lulpay_';

  private constructor() {}

  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Set item with optional encryption and expiry
  setItem(key: string, value: string, options: SecureStorageOptions = {}): void {
    try {
      const prefixedKey = this.prefix + key;
      let dataToStore = value;

      // Add expiry if specified
      if (options.expiry) {
        const expiryTime = Date.now() + options.expiry;
        const dataWithExpiry = {
          value: dataToStore,
          expiry: expiryTime
        };
        dataToStore = JSON.stringify(dataWithExpiry);
      }

      // Basic obfuscation (not real encryption, but better than plain text)
      if (options.encrypt) {
        dataToStore = btoa(dataToStore);
      }

      localStorage.setItem(prefixedKey, dataToStore);
    } catch (error) {
      console.error('Error storing secure data:', error);
    }
  }

  // Get item with automatic expiry check
  getItem(key: string, options: SecureStorageOptions = {}): string | null {
    try {
      const prefixedKey = this.prefix + key;
      let storedData = localStorage.getItem(prefixedKey);

      if (!storedData) {
        return null;
      }

      // Decode if encrypted
      if (options.encrypt) {
        try {
          storedData = atob(storedData);
        } catch {
          // If decoding fails, data might be corrupted
          this.removeItem(key);
          return null;
        }
      }

      // Check expiry if data has expiry
      if (options.expiry) {
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData.expiry && Date.now() > parsedData.expiry) {
            this.removeItem(key);
            return null;
          }
          return parsedData.value;
        } catch {
          // If parsing fails, treat as non-expiry data
          return storedData;
        }
      }

      return storedData;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  // Remove item
  removeItem(key: string): void {
    const prefixedKey = this.prefix + key;
    localStorage.removeItem(prefixedKey);
  }

  // Clear all app-specific data
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Check if item exists and is not expired
  hasItem(key: string, options: SecureStorageOptions = {}): boolean {
    return this.getItem(key, options) !== null;
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();

// Token-specific utilities
export const tokenStorage = {
  setToken: (token: string) => {
    secureStorage.setItem('auth_token', token, {
      encrypt: true,
      expiry: 24 * 60 * 60 * 1000 // 24 hours
    });
  },

  getToken: (): string | null => {
    return secureStorage.getItem('auth_token', { encrypt: true });
  },

  removeToken: () => {
    secureStorage.removeItem('auth_token');
  },

  hasValidToken: (): boolean => {
    return secureStorage.hasItem('auth_token', { encrypt: true });
  }
};

export default secureStorage; 