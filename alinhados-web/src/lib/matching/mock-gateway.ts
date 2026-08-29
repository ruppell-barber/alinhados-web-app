import type {
  ContraparteAlinhamento,
  MarcarDeuCertoInput,
  ResumoAlinhamento,
  StatusAlinhamento,
  VisibilidadePosContratacao,
} from '@/contracts-local';
import { emitirNotificacao } from '@/lib/notificacoes';
import type { MatchingGateway } from './gateway';

/**
 * Perfis do seed que "já curtiram" o usuário — no back isso sai da tabela `swipes`
 * (like recíproco). Aqui é fixo para o fluxo demo produzir um alinhamento no primeiro
 * like: são os perfis de São Paulo, que o RN03 coloca no topo do feed.
 */
const PERFIS_QUE_JA_CURTIRAM = new Set<string>([
  '10000000-0000-4000-8000-000000000001', // João Almeida (barbeiro · SP)
  '20000000-0000-4000-8000-000000000001', // Barbearia do Zé (barbearia · SP)
]);

interface AlinhamentoArmazenado {
  id: string;
  contraparte: ContraparteAlinhamento;
  deu_certo: boolean;
  encerrado: boolean;
  visibilidade: VisibilidadePosContratacao | null;
  created_at: string;
}

function chave(usuarioId: string) {
  return `alinhados.alinhamentos.${usuarioId}`;
}

function ler(usuarioId: string): AlinhamentoArmazenado[] {
  try {
    return JSON.parse(localStorage.getItem(chave(usuarioId)) ?? '[]') as AlinhamentoArmazenado[];
  } catch {
    return [];
  }
}

function salvar(usuarioId: string, itens: AlinhamentoArmazenado[]) {
  localStorage.setItem(chave(usuarioId), JSON.stringify(itens));
}

function novoId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Deriva o status para a UI (E10). O banco guarda só `deu_certo`/encerramento. */
export function statusDe(
  a: Pick<AlinhamentoArmazenado, 'deu_certo' | 'encerrado'>,
): StatusAlinhamento {
  if (a.deu_certo) return 'deu_certo';
  if (a.encerrado) return 'encerrado';
  return 'ativo';
}

function resumoDe(a: AlinhamentoArmazenado): ResumoAlinhamento {
  return {
    id: a.id,
    contraparte: a.contraparte,
    status: statusDe(a),
    deu_certo: a.deu_certo,
    created_at: a.created_at,
  };
}

/** Matching em modo dev — alinhamentos por usuário no localStorage. */
export class MockMatchingGateway implements MatchingGateway {
  async avaliarAposLike(
    usuarioId: string,
    contraparte: ContraparteAlinhamento,
  ): Promise<ResumoAlinhamento | null> {
    if (!PERFIS_QUE_JA_CURTIRAM.has(contraparte.id)) return null; // sem reciprocidade, sem alinhamento

    const itens = ler(usuarioId);
    // Idempotente por contraparte (RN13 permite vários alinhamentos, um por par).
    const existente = itens.find((a) => a.contraparte.id === contraparte.id);
    if (existente) return resumoDe(existente);

    const novo: AlinhamentoArmazenado = {
      id: novoId(),
      contraparte,
      deu_certo: false,
      encerrado: false,
      visibilidade: null,
      created_at: new Date().toISOString(),
    };
    salvar(usuarioId, [novo, ...itens]);

    // Fan-out do evento de alinhamento → Notificações (Wiki C4 matching → notificações).
    emitirNotificacao(usuarioId, {
      tipo: 'alinhamento',
      titulo: 'Alinhamento encontrado! 💈',
      corpo: `Você e ${contraparte.nome ?? 'a outra parte'} demonstraram interesse. Abra a conversa.`,
      match_id: novo.id,
    });

    return resumoDe(novo);
  }

  async listar(usuarioId: string): Promise<ResumoAlinhamento[]> {
    return ler(usuarioId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(resumoDe);
  }

  async buscar(usuarioId: string, id: string): Promise<ResumoAlinhamento | null> {
    const a = ler(usuarioId).find((x) => x.id === id);
    return a ? resumoDe(a) : null;
  }

  async marcarDeuCerto(
    usuarioId: string,
    input: MarcarDeuCertoInput,
  ): Promise<ResumoAlinhamento | null> {
    const itens = ler(usuarioId);
    const alvo = itens.find((a) => a.id === input.matchId);
    if (!alvo) return null;
    // Idempotência (RN16): já marcado não conta conversão de novo — só devolve o estado.
    if (!alvo.deu_certo) {
      alvo.deu_certo = true;
      alvo.visibilidade = input.visibilidade ?? alvo.visibilidade;
      salvar(usuarioId, itens);
    }
    return resumoDe(alvo);
  }
}
