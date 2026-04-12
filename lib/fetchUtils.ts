// Shared fetch utilities — timeout + retry with exponential backoff.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  {
    timeoutMs = 8000,
    maxRetries = 2,
    baseDelay = 500,
  } = {},
): Promise<Response | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs)
      if (res.ok || res.status === 404 || res.status === 400) return res
      // 5xx → retry
      if (attempt < maxRetries) await sleep(baseDelay * 2 ** attempt)
    } catch {
      // Network error or timeout → retry
      if (attempt < maxRetries) await sleep(baseDelay * 2 ** attempt)
    }
  }
  return null
}
