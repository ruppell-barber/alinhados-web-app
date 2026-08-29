import type { MatchingGateway } from './gateway';
import { MockMatchingGateway } from './mock-gateway';

/**
 * Sem API de Matching ainda: usamos o mock. Quando o adapter real existir, a seleção
 * passa por env (como o AuthGateway); o resto do app depende só da porta.
 */
export const matchingGateway: MatchingGateway = new MockMatchingGateway();

export { statusDe } from './mock-gateway';
export type { MatchingGateway } from './gateway';
