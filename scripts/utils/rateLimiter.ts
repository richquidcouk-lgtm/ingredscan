export class RateLimiter {
  private tokens: number
  private maxTokens: number
  private refillRate: number // tokens per ms
  private lastRefill: number

  constructor(requestsPerSecond: number) {
    this.maxTokens = requestsPerSecond
    this.tokens = requestsPerSecond
    this.refillRate = requestsPerSecond / 1000
    this.lastRefill = Date.now()
  }

  async throttle(): Promise<void> {
    this.refill()

    if (this.tokens < 1) {
      const waitTime = Math.ceil((1 - this.tokens) / this.refillRate)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      this.refill()
    }

    this.tokens -= 1
  }

  private refill() {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate)
    this.lastRefill = now
  }
}
