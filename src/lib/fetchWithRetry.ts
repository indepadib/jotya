// Resilient fetch wrapper with retry logic and exponential backoff

interface FetchWithRetryOptions extends RequestInit {
    retries?: number;
    retryDelay?: number;
    timeout?: number;
}

export async function fetchWithRetry(
    url: string,
    options: FetchWithRetryOptions = {}
): Promise<Response> {
    const {
        retries = 3,
        retryDelay = 1000,
        timeout = 10000,
        ...fetchOptions
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Don't retry on client errors (4xx), only server errors (5xx) or network issues
            if (response.ok || (response.status >= 400 && response.status < 500)) {
                return response;
            }

            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (error) {
            lastError = error as Error;

            // Don't retry if it's the last attempt
            if (attempt === retries) {
                break;
            }

            // Don't retry on AbortError (timeout)
            if (error instanceof Error && error.name === 'AbortError') {
                break;
            }

            // Exponential backoff: wait longer each time
            const delay = retryDelay * Math.pow(2, attempt);
            console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}
