// Exponential backoff options configuration
export const BACKOFF_OPTIONS_CONFIG = {
  delayFirstAttempt: false, // First attempt happens immediately (no initial delay)
  startingDelay: 300, // Initial delay (in ms) between first and second attempt is 300ms
  timeMultiple: 2, // Each retry delay will double: 300ms → 600ms → 1200ms → ...
  jitter: 'full', // Adds random jitter to each delay to avoid thundering herd problem
  maxDelay: 5000, // Delay will never exceed 5000ms between any two consecutive retries
  numOfAttempts: 5, // Retry up to 5 total attempts (initial + 4 retries)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retry: (error: any, attempt: number) => {
    console.warn(`Attempt ${attempt} failed. Retrying...`, error)
    // Don't retry on client errors (4xx) except except 408 Request Timeout and 429 Too Many Requests
    if (
      error.status >= 400 &&
      error.status < 500 &&
      error.status !== 408 &&
      error.status !== 429
    ) {
      return false
    }
    return true
  },
} as const // literal typed object
