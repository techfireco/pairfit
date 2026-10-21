// Allowlist for the same-origin /sb proxy to Supabase.
//
// Clients only need two things from Supabase directly:
//   - Auth (sign up / sign in / refresh / OAuth)   -> /auth/v1/...
//   - Photos via URLs the API server signed          -> /storage/v1/object/sign/...
// Everything else (PostgREST, raw storage uploads, Studio, pg-meta) stays
// unreachable, so all wardrobe writes go through the API and its free-plan limit.

const ALLOWED_PREFIXES = ['/auth/v1/', '/storage/v1/object/sign/'];
// An upstream that decodes %2F / %5C could turn them into real separators.
const ENCODED_SEPARATOR = /%2f|%5c/i;
const PARSE_BASE = 'http://proxy.invalid';

// Returns the normalized upstream path (+ query) if allowed, otherwise null.
function resolveProxyPath(rawPath) {
  if (typeof rawPath !== 'string' || !rawPath.startsWith('/') || rawPath.startsWith('//')) return null;
  if (ENCODED_SEPARATOR.test(rawPath.split('?')[0])) return null;

  let url;
  try {
    // WHATWG URL resolves ../, %2e%2e and backslashes, so the prefix check below
    // sees the same path the upstream will.
    url = new URL(rawPath, PARSE_BASE);
  } catch (e) {
    return null;
  }
  if (url.origin !== PARSE_BASE) return null;
  if (!ALLOWED_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) return null;
  return url.pathname + url.search;
}

module.exports = { resolveProxyPath };
