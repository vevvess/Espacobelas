// Circuit breaker for connectivity testing to prevent excessive requests

class ConnectivityCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private lastTestTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly maxFailures = 3;
  private readonly cooldownMs = 30000; // 30 seconds
  private readonly minTestIntervalMs = 5000; // 5 seconds between tests

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Enforce minimum interval between tests
    if (now - this.lastTestTime < this.minTestIntervalMs) {
      throw new Error('Connectivity test rate limited');
    }

    // Check circuit breaker state
    if (this.state === 'open') {
      if (now - this.lastFailureTime > this.cooldownMs) {
        this.state = 'half-open';
        console.log('🔄 Connectivity circuit breaker: half-open state');
      } else {
        throw new Error('Connectivity test circuit breaker is open');
      }
    }

    this.lastTestTime = now;

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (this.failures > 0) {
        console.log('✅ Connectivity circuit breaker: reset after success');
        this.failures = 0;
        this.state = 'closed';
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = now;

      if (this.failures >= this.maxFailures) {
        this.state = 'open';
        console.warn(`🚨 Connectivity circuit breaker: OPEN (${this.failures} failures)`);
      }

      throw error;
    }
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      timeSinceLastFailure: this.lastFailureTime ? Date.now() - this.lastFailureTime : 0,
      timeSinceLastTest: this.lastTestTime ? Date.now() - this.lastTestTime : 0,
      canTest: this.state !== 'open' && (Date.now() - this.lastTestTime) >= this.minTestIntervalMs
    };
  }

  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
    console.log('🔄 Connectivity circuit breaker: manual reset');
  }

  forceTest() {
    // Allow immediate test by resetting the last test time
    this.lastTestTime = 0;
  }
}

export const connectivityCircuitBreaker = new ConnectivityCircuitBreaker();

// Wrapper function for protected connectivity testing
export async function safeTestConnectivity(): Promise<boolean> {
  try {
    const { testConnectivity } = await import('./networkUtils');
    return await connectivityCircuitBreaker.execute(() => testConnectivity());
  } catch (error) {
    if (error.message.includes('circuit breaker') || error.message.includes('rate limited')) {
      console.warn('⚠️ Connectivity test blocked by circuit breaker');
      return false; // Assume no connectivity when circuit breaker is active
    }
    throw error;
  }
}
