/**
 * Validated browser environment loading.
 *
 * Only `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and
 * `VITE_APP_URL` are accepted. Any missing value throws a clear error without
 * exposing the actual value in logs (Research #8, Plan constraints).
 */

export interface AppEnv {
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
  readonly appUrl: string;
}

const REQUIRED_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_APP_URL",
] as const;

type RequiredKey = (typeof REQUIRED_KEYS)[number];

function readRawEnv(): Record<RequiredKey, string | undefined> {
  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
  };
}

function assertNonEmpty(raw: Record<RequiredKey, string | undefined>): void {
  const missing: RequiredKey[] = REQUIRED_KEYS.filter((key) => {
    const value = raw[key];
    return typeof value !== "string" || value.trim() === "";
  });

  if (missing.length > 0) {
    throw new Error(
      `Variaveis de ambiente obrigatorias ausentes: ${missing.join(", ")}. ` +
        "Configure o arquivo .env com base em .env.example.",
    );
  }
}

let cachedEnv: AppEnv | undefined;

/**
 * Loads and validates the browser-facing environment.
 * Throws synchronously if any required publishable variable is missing.
 * Never logs the resolved values.
 */
export function loadAppEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const raw = readRawEnv();
  assertNonEmpty(raw);

  cachedEnv = {
    supabaseUrl: raw.VITE_SUPABASE_URL as string,
    supabasePublishableKey: raw.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    appUrl: raw.VITE_APP_URL as string,
  };

  return cachedEnv;
}
