const MINIO_BUCKET_NAME = "garritwulf-media";

const MINIO_INTERNAL_HOSTS = ["minio", "gw-minio", "localhost", "127.0.0.1"];

const MINIO_HOST_KEYWORDS = ["minio"];

export const MINIO_PUBLIC_FOLDERS = [
  "products/",
  "categories/",
  "general/",
  "icons/",
] as const;

const PUBLIC_FILENAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export function isAllowedPublicKey(key: string): boolean {
  const sanitized = key.trim();

  if (!sanitized || sanitized.startsWith("/")) {
    return false;
  }

  if (sanitized.includes("..")) {
    return false;
  }

  if (sanitized.includes("/")) {
    return MINIO_PUBLIC_FOLDERS.some((prefix) => sanitized.startsWith(prefix));
  }

  return PUBLIC_FILENAME_PATTERN.test(sanitized);
}

export function buildPublicMediaUrl(key: string): string {
  return `/api/media/public?key=${encodeURIComponent(key.trim())}`;
}

export interface MinioSourceResolution {
  key: string | null;
  url: string;
  isExternal: boolean;
}

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

function isLikelyMinioHost(host: string): boolean {
  const normalized = host.toLowerCase();

  if (MINIO_INTERNAL_HOSTS.includes(normalized)) {
    return true;
  }

  return MINIO_HOST_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function extractKeyFromPath(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  if (parts[0] === MINIO_BUCKET_NAME) {
    return parts.slice(1).join("/");
  }

  return parts.join("/");
}

export function resolveMinioSource(
  value?: string | null,
): MinioSourceResolution {
  const raw = value?.trim() ?? "";

  if (!raw) {
    return { key: null, url: "", isExternal: false };
  }

  if (!isHttpUrl(raw)) {
    if (raw.startsWith(`${MINIO_BUCKET_NAME}/`)) {
      return {
        key: raw.slice(MINIO_BUCKET_NAME.length + 1),
        url: raw,
        isExternal: false,
      };
    }

    return { key: raw, url: raw, isExternal: false };
  }

  try {
    const parsedUrl = new URL(raw);
    const host = parsedUrl.hostname;
    const isMinio = isLikelyMinioHost(host);

    if (isMinio) {
      const key = extractKeyFromPath(parsedUrl.pathname);

      if (!key) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[minio-client] Unable to derive MinIO key from URL",
            raw,
          );
        }

        return { key: null, url: raw, isExternal: false };
      }

      return {
        key,
        url: raw,
        isExternal: false,
      };
    }

    return { key: null, url: raw, isExternal: true };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[minio-client] Failed to parse URL", raw, error);
    }

    return { key: null, url: raw, isExternal: true };
  }
}

export function normalizeMinioValue(value: string): string {
  const resolution = resolveMinioSource(value);
  return resolution.key ?? resolution.url;
}

export function extractKeyFromUrl(value: string): string {
  const resolution = resolveMinioSource(value);
  if (!resolution.key && process.env.NODE_ENV !== "production") {
    console.warn("[minio-client] extractKeyFromUrl returned empty key", value);
  }
  return resolution.key ?? "";
}

export { MINIO_BUCKET_NAME };
