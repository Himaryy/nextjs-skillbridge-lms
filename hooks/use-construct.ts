import { env } from "@/lib/env";

// Construct the COPY URL from Tigris
export function useConstructURL(key: string): string {
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAMES_IMAGES}.t3.storage.dev/${key}`;
}
