const APP_ORIGIN = 'https://zamorafest.invalid';

const STATIC_APP_PATHS = new Set([
  '/login',
  '/register',
  '/explore',
  '/environment',
  '/gestion',
  '/gestion/eventos/nuevo',
]);

const PROTECTED_PATHS = new Set([
  '/gestion',
  '/gestion/eventos/nuevo',
]);

function isRecognizedPath(pathname: string): boolean {
  if (STATIC_APP_PATHS.has(pathname)) {
    return true;
  }

  return /^\/eventos\/[1-9]\d*$/.test(pathname);
}

export function sanitizeInternalAppDestination(
  destination: string | null | undefined,
): string | null {
  if (destination === null || destination === undefined) {
    return null;
  }

  const candidate = destination.trim();

  if (
    candidate.length === 0 ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//')
  ) {
    return null;
  }

  try {
    const parsed = new URL(candidate, APP_ORIGIN);

    if (parsed.origin !== APP_ORIGIN) {
      return null;
    }

    if (!isRecognizedPath(parsed.pathname)) {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function sanitizeProtectedDestination(
  destination: string | null | undefined,
): string | null {
  const safeDestination =
    sanitizeInternalAppDestination(destination);

  if (safeDestination === null) {
    return null;
  }

  const parsed = new URL(safeDestination, APP_ORIGIN);

  if (!PROTECTED_PATHS.has(parsed.pathname)) {
    return null;
  }

  return safeDestination;
}

export function buildLoginRedirect(
  destination: string,
): string {
  const safeDestination =
    sanitizeProtectedDestination(destination);

  if (safeDestination === null) {
    return '/login';
  }

  return `/login?redirect=${encodeURIComponent(
    safeDestination,
  )}`;
}

export function resolvePostLoginDestination(
  destination: string | null | undefined,
): string {
  return sanitizeProtectedDestination(destination) ?? '/explore';
}
