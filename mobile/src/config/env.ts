const supportedProtocols = new Set(['http:', 'https:']);

export function parseApiBaseUrl(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('VITE_API_BASE_URL es obligatoria.');
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value.trim());
  } catch {
    throw new Error('VITE_API_BASE_URL debe contener una URL válida.');
  }

  if (!supportedProtocols.has(parsedUrl.protocol)) {
    throw new Error('VITE_API_BASE_URL debe utilizar HTTP o HTTPS.');
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('VITE_API_BASE_URL no debe incluir credenciales.');
  }

  if (
    parsedUrl.pathname !== '/' ||
    parsedUrl.search.length > 0 ||
    parsedUrl.hash.length > 0
  ) {
    throw new Error(
      'VITE_API_BASE_URL debe contener únicamente el origen de la API.',
    );
  }

  return parsedUrl.origin;
}

export function getApiBaseUrl(): string {
  return parseApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
}
