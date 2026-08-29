import type { AuthGateway } from './gateway';
import { MockAuthGateway } from './mock-gateway';
import { SupabaseAuthGateway } from './supabase-gateway';

export { AuthError, type AuthGateway } from './gateway';

let instancia: AuthGateway | null = null;

/** Composition root do auth: Supabase quando configurado, mock caso contrário. */
export function obterAuthGateway(): AuthGateway {
  if (!instancia) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    instancia = url && anonKey ? new SupabaseAuthGateway(url, anonKey) : new MockAuthGateway();
  }
  return instancia;
}
