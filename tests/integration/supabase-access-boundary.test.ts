/**
 * Regression coverage (T054) confirming the frontend's access/auth code only
 * uses publishable-key Supabase requests and tables already covered by RLS
 * under Spec 001, per `operational-access-contract.md` Security Invariants
 * ("Never initialize the browser client with secret/service-role key.") and
 * the constitutional "no new permission model" constraint.
 *
 * This is a static source scan rather than a live RLS probe: there is no
 * backend in this SPA to probe, so the boundary is enforced by inspecting
 * the access/auth source for forbidden tokens and table references.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "../..");

const SCANNED_DIRS = [
  "src/lib",
  "src/modules/access",
  "src/modules/auth",
  "src/services",
  "src/app",
];

/** Tables already covered by RLS under Spec 001/004 that access/auth code may reference. */
const ALLOWED_TABLES = ["usuarios", "usuarios_postos", "postos", "historico_auditoria"];

const FORBIDDEN_TOKENS = [
  "service_role",
  "SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_KEY",
  "secret_key",
];

function listSourceFiles(relativeDir: string): string[] {
  const absoluteDir = path.join(REPO_ROOT, relativeDir);
  const entries = readdirSync(absoluteDir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(absoluteDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(path.relative(REPO_ROOT, entryPath)));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

function readAllScannedSources(): { file: string; content: string }[] {
  const files = SCANNED_DIRS.flatMap((dir) => listSourceFiles(dir));
  return files.map((file) => ({ file, content: readFileSync(file, "utf8") }));
}

describe("Supabase access boundary (frontend-only, publishable key, existing RLS tables)", () => {
  it("never references a service-role/secret key anywhere in access/auth/lib/services/app source", () => {
    const sources = readAllScannedSources();
    for (const { file, content } of sources) {
      for (const token of FORBIDDEN_TOKENS) {
        expect(content.includes(token), `${file} must not reference "${token}"`).toBe(false);
      }
    }
  });

  it("the Supabase client factory only reads the validated publishable env vars", () => {
    const content = readFileSync(path.join(REPO_ROOT, "src/lib/env.ts"), "utf8");
    expect(content).toContain("VITE_SUPABASE_PUBLISHABLE_KEY");
    expect(content).not.toMatch(/SERVICE_ROLE/);
  });

  it("access-service.ts only queries tables already covered by Spec 001 RLS", () => {
    const content = readFileSync(
      path.join(REPO_ROOT, "src/modules/access/access-service.ts"),
      "utf8",
    );
    const fromCalls = [...content.matchAll(/\.from\(["'`]([^"'`]+)["'`]\)/g)].map((match) => match[1]);
    expect(fromCalls.length).toBeGreaterThan(0);
    for (const table of fromCalls) {
      expect(ALLOWED_TABLES, `Unexpected table referenced: ${table}`).toContain(table);
    }
  });

  it("audit-service.ts only calls the allowlisted RPC, never a direct table insert into historico_auditoria", () => {
    const content = readFileSync(path.join(REPO_ROOT, "src/services/audit-service.ts"), "utf8");
    expect(content).toContain("registrar_evento_autenticacao");
    expect(content).not.toMatch(/\.from\(\s*["'`]historico_auditoria["'`]\s*\)\s*\.insert/);
  });

  it("access-service.ts never reads user_metadata for authorization", () => {
    const content = readFileSync(
      path.join(REPO_ROOT, "src/modules/access/access-service.ts"),
      "utf8",
    );
    expect(content).not.toMatch(/user_metadata/);
  });

  it("route-guard.ts never reads user_metadata or persistent storage for authorization", () => {
    const content = readFileSync(path.join(REPO_ROOT, "src/modules/access/route-guard.ts"), "utf8");
    expect(content).not.toMatch(/user_metadata/);
    expect(content).not.toMatch(/localStorage|sessionStorage/);
  });
});
