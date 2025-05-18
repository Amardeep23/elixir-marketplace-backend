type TokenCacheEntry = {
    token: string;
    expiresAt: number;
  };
  
  const cache: Record<string, TokenCacheEntry> = {};
  
  /**
   * Save a token with expiration
   */
  export function setToken(vendor: string, token: string, ttlMs: number): void {
    cache[vendor] = {
      token,
      expiresAt: Date.now() + ttlMs
    };
  }
  
  /**
   * Retrieve token if valid
   */
  export function getToken(vendor: string): string | null {
    const entry = cache[vendor];
    if (!entry || Date.now() > entry.expiresAt) {
      return null;
    }
    return entry.token;
  }
  