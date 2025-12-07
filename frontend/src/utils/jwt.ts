interface JWTPayload {
  userId?: number;
  [key: string]: unknown;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch {
    return null;
  }
}

export function getUserIdFromToken(): number | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('coinhub_token');
  if (!token) return null;

  const decoded = decodeJWT(token);
  return decoded?.userId || null;
}
