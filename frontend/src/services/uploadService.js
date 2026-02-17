import { tokenService } from './tokenService';

const UPLOAD_URL = '/upload';

/**
 * Upload a file to the server via multipart/form-data.
 * Returns { url, fileName, originalName }.
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const token = tokenService.getToken();

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Validate a URL string.
 */
export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
