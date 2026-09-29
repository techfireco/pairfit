/**
 * PairFit Central Error Mapper
 * Maps technical runtime / network / server exceptions to user-friendly messages.
 * Logs raw technical errors to console for developer debugging.
 */
export function getUserFriendlyErrorMessage(error: any, context?: string): string {
  if (error) {
    console.error(`[PairFit Error]${context ? ` [${context}]` : ''}:`, error);
  }

  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  const rawMessage = String(typeof error === 'string' ? error : error?.message || '');
  const status = error?.status;

  // DNS / Connectivity / Network failures
  if (
    rawMessage.includes('UnknownHostException') ||
    rawMessage.includes('Network request failed') ||
    rawMessage.includes('Failed to fetch') ||
    rawMessage.includes('ENOTFOUND') ||
    rawMessage.includes('ECONNREFUSED') ||
    rawMessage.includes('ETIMEDOUT') ||
    rawMessage.includes('NetworkError') ||
    rawMessage.includes('Unable to resolve host') ||
    rawMessage.includes('fetch failed') ||
    rawMessage.includes('Network error')
  ) {
    return "Can't connect right now. Check your internet connection and try again.";
  }

  // Freemium 402 Upgrade Limit
  if (
    status === 402 ||
    error?.upgrade ||
    rawMessage.toLowerCase().includes('free plan limit') ||
    rawMessage.toLowerCase().includes('upgrade')
  ) {
    return "You've reached the 30-item free wardrobe limit.";
  }

  // Auth / session expiration
  if (
    status === 401 ||
    rawMessage.includes('Login required') ||
    rawMessage.includes('Session expired') ||
    rawMessage.includes('JWT')
  ) {
    return 'Your session has expired. Please sign in again.';
  }

  // Upload failures
  if (
    rawMessage.includes('FormDataPart') ||
    rawMessage.includes('upload') ||
    rawMessage.includes('multipart') ||
    rawMessage.includes('Sharp')
  ) {
    return "We couldn't upload that photo. Please try again.";
  }

  // 5xx Server errors
  if (status && status >= 500) {
    return 'Something went wrong on our side. Please try again in a moment.';
  }

  // User-facing validation messages
  if (
    rawMessage.length > 0 &&
    rawMessage.length < 90 &&
    !rawMessage.includes('java.') &&
    !rawMessage.includes('Exception') &&
    !rawMessage.includes('at ') &&
    !rawMessage.includes('[object') &&
    !rawMessage.includes('sslip.io')
  ) {
    return rawMessage;
  }

  return 'Something went wrong on our side. Please try again in a moment.';
}
