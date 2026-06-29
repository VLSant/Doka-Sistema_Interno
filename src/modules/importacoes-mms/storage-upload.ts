import * as tus from "tus-js-client";
import type { ImportReservation } from "./types";

export interface StorageUploadOptions {
  supabaseUrl: string;
  accessToken: string;
  reservation: ImportReservation;
  file: File;
  signal?: AbortSignal;
  onProgress?: (percentage: number) => void;
  onRetry?: () => void;
}

function directStorageEndpoint(supabaseUrl: string): string {
  const url = new URL(supabaseUrl);
  const projectRef = url.hostname.split(".")[0];
  if (!projectRef) throw new Error("URL do Supabase inválida.");
  return `${url.protocol}//${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;
}

export function uploadOriginalMmsFile(options: StorageUploadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const upload = new tus.Upload(options.file, {
      endpoint: directStorageEndpoint(options.supabaseUrl),
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      headers: {
        authorization: `Bearer ${options.accessToken}`,
        "x-upsert": "false",
      },
      metadata: {
        bucketName: options.reservation.bucket,
        objectName: options.reservation.caminho,
        contentType: options.file.type,
        cacheControl: "3600",
      },
      onShouldRetry(error, retryAttempt, retryOptions) {
        options.onRetry?.();
        return tus.defaultOptions.onShouldRetry?.(error, retryAttempt, retryOptions) ?? true;
      },
      onProgress(bytesUploaded, bytesTotal) {
        options.onProgress?.(bytesTotal === 0 ? 0 : (bytesUploaded / bytesTotal) * 100);
      },
      onError(error) {
        if (!settled) {
          settled = true;
          reject(error);
        }
      },
      onSuccess() {
        if (!settled) {
          settled = true;
          resolve();
        }
      },
    });

    const abort = () => {
      if (settled) return;
      settled = true;
      void upload.abort(true);
      reject(new DOMException("Upload cancelado.", "AbortError"));
    };

    if (options.signal?.aborted) {
      abort();
      return;
    }
    options.signal?.addEventListener("abort", abort, { once: true });
    upload.start();
  });
}
