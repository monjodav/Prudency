const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

/**
 * Calls a Supabase Edge Function with retry and exponential backoff.
 * Only retries on 5xx errors or network failures.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options?: RetryOptions,
): Promise<Response> {
  const maxRetries = options?.maxRetries ?? MAX_RETRIES;
  const baseDelay = options?.baseDelayMs ?? BASE_DELAY_MS;

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);

      if (response.ok || response.status < 500) {
        return response;
      }

      lastResponse = response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError ?? new Error("fetchWithRetry: all attempts failed");
}
