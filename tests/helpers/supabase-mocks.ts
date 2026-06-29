/**
 * Deterministic Supabase Auth/Data API test doubles.
 *
 * These mocks let unit/integration tests exercise auth-service,
 * access-service, and providers without a real Supabase project. They
 * intentionally implement only the subset of the client surface this
 * feature uses (`signInWithPassword`, `signOut`, `getUser`,
 * `onAuthStateChange`, `from(...).select(...)`, `rpc(...)`).
 */
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

export interface MockUserRow {
  id: string;
  auth_user_id: string;
  nome: string;
  email: string;
  perfil: "operador" | "supervisao" | "direcao_admin";
  ativo: boolean;
  deleted_at: string | null;
}

export interface MockPostoVinculoRow {
  usuario_id: string;
  posto_id: string;
  nivel_acesso: "operacional" | "supervisao" | "consulta";
  deleted_at: string | null;
}

export interface MockPostoRow {
  id: string;
  nome: string;
  codigo: string | null;
  ativo: boolean;
  deleted_at: string | null;
}

/** Builds a minimal fake Supabase `User`. */
export function buildMockAuthUser(overrides: Partial<User> = {}): User {
  return {
    id: "10000000-0000-0000-0000-000000000001",
    aud: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-01-01T00:00:00.000Z",
    email: "operador@doka.test",
    ...overrides,
  } as User;
}

/** Builds a minimal fake Supabase `Session`. */
export function buildMockSession(overrides: Partial<Session> = {}): Session {
  const user = overrides.user ?? buildMockAuthUser();
  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user,
    ...overrides,
  } as Session;
}

type AuthChangeListener = (event: AuthChangeEvent, session: Session | null) => void;

/**
 * Fixtures for the three official profiles plus missing profile, inactive
 * user, and missing posto, matching `supabase/seed/fundacao_operacional_seed.sql`.
 */
export const mockUsuarios: Record<string, MockUserRow> = {
  operador: {
    id: "30000000-0000-0000-0000-000000000001",
    auth_user_id: "10000000-0000-0000-0000-000000000001",
    nome: "Operador Teste",
    email: "operador@doka.test",
    perfil: "operador",
    ativo: true,
    deleted_at: null,
  },
  supervisao: {
    id: "30000000-0000-0000-0000-000000000002",
    auth_user_id: "10000000-0000-0000-0000-000000000002",
    nome: "Supervisao Teste",
    email: "supervisao@doka.test",
    perfil: "supervisao",
    ativo: true,
    deleted_at: null,
  },
  direcaoAdmin: {
    id: "30000000-0000-0000-0000-000000000003",
    auth_user_id: "10000000-0000-0000-0000-000000000003",
    nome: "Direcao Teste",
    email: "direcao@doka.test",
    perfil: "direcao_admin",
    ativo: true,
    deleted_at: null,
  },
  inativo: {
    id: "30000000-0000-0000-0000-000000000005",
    auth_user_id: "10000000-0000-0000-0000-000000000005",
    nome: "Usuario Inativo",
    email: "inativo@doka.test",
    perfil: "operador",
    ativo: false,
    deleted_at: null,
  },
};

export const mockPostos: MockPostoRow[] = [
  { id: "40000000-0000-0000-0000-000000000001", nome: "Posto A", codigo: "POSTO_A", ativo: true, deleted_at: null },
  { id: "40000000-0000-0000-0000-000000000002", nome: "Posto B", codigo: "POSTO_B", ativo: true, deleted_at: null },
  {
    id: "40000000-0000-0000-0000-000000000004",
    nome: "Posto Inativo",
    codigo: "POSTO_INATIVO",
    ativo: false,
    deleted_at: null,
  },
];

export const mockVinculos: MockPostoVinculoRow[] = [
  {
    usuario_id: "30000000-0000-0000-0000-000000000001",
    posto_id: "40000000-0000-0000-0000-000000000001",
    nivel_acesso: "operacional",
    deleted_at: null,
  },
  {
    usuario_id: "30000000-0000-0000-0000-000000000002",
    posto_id: "40000000-0000-0000-0000-000000000001",
    nivel_acesso: "supervisao",
    deleted_at: null,
  },
];

export interface MockSupabaseAuth {
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
    data: { user: User | null; session: Session | null };
    error: { message: string } | null;
  }>;
  signOut: (options?: { scope?: "local" | "global" | "others" }) => Promise<{ error: { message: string } | null }>;
  getUser: () => Promise<{ data: { user: User | null }; error: { message: string } | null }>;
  getSession: () => Promise<{ data: { session: Session | null }; error: { message: string } | null }>;
  onAuthStateChange: (callback: AuthChangeListener) => {
    data: { subscription: { unsubscribe: () => void } };
  };
  /** Test helper: triggers a registered listener as the real client would. */
  __emit: (event: AuthChangeEvent, session: Session | null) => void;
  /** Test helper: returns how many active listeners remain subscribed. */
  __listenerCount: () => number;
}

export interface MockSupabaseClient {
  auth: MockSupabaseAuth;
  from: (table: string) => unknown;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
}

export interface CreateMockSupabaseClientOptions {
  initialUser?: User | null;
  initialSession?: Session | null;
  signInResult?: { user: User | null; session: Session | null; error: { message: string } | null };
  rpcImplementation?: (
    fn: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
}

/**
 * Creates a deterministic mock Supabase client implementing only the
 * surface used by this feature. Tests can call `client.auth.__emit(...)` to
 * simulate `onAuthStateChange` events exactly as documented in
 * `auth-session-contract.md`.
 */
export function createMockSupabaseClient(options: CreateMockSupabaseClientOptions = {}): MockSupabaseClient {
  const listeners = new Set<AuthChangeListener>();
  let currentUser: User | null = options.initialUser ?? null;

  const auth: MockSupabaseAuth = {
    async signInWithPassword() {
      const result = options.signInResult ?? {
        user: buildMockAuthUser(),
        session: buildMockSession(),
        error: null,
      };
      if (!result.error) {
        currentUser = result.user;
      }
      return { data: { user: result.user, session: result.session }, error: result.error };
    },
    async signOut() {
      currentUser = null;
      return { error: null };
    },
    async getUser() {
      return { data: { user: currentUser }, error: null };
    },
    async getSession() {
      return { data: { session: options.initialSession ?? null }, error: null };
    },
    onAuthStateChange(callback: AuthChangeListener) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              listeners.delete(callback);
            },
          },
        },
      };
    },
    __emit(event, session) {
      currentUser = session?.user ?? null;
      for (const listener of listeners) {
        listener(event, session);
      }
    },
    __listenerCount() {
      return listeners.size;
    },
  };

  return {
    auth,
    from() {
      throw new Error(
        "createMockSupabaseClient().from() is not implemented; provide a dedicated query mock per test.",
      );
    },
    async rpc(fn, args) {
      if (options.rpcImplementation) {
        return options.rpcImplementation(fn, args);
      }
      return { data: null, error: null };
    },
  };
}
