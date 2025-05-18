export async function retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let attempt = 0;
  
    while (attempt < retries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= retries) {
          throw err;
        }
        await delay(delayMs);
      }
    }
  
    // This should never be hit due to throw above
    throw new Error('Retry attempts exhausted');
  }
  
  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  