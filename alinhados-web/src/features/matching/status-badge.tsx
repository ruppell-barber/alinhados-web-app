import type { StatusAlinhamento } from '@/contracts-local';

const ESTILO: Record<StatusAlinhamento, { rotulo: string; classe: string }> = {
  ativo: { rotulo: 'Ativo', classe: 'bg-grape text-ink' },
  deu_certo: { rotulo: 'Deu certo ✓', classe: 'bg-mint text-ink' },
  encerrado: { rotulo: 'Encerrado', classe: 'bg-paper/20 text-paper' },
};

/** Marcador de status do alinhamento (E10 — distingue ativo / "Deu certo" / encerrado). */
export function StatusBadge({ status }: { status: StatusAlinhamento }) {
  const { rotulo, classe } = ESTILO[status];
  return (
    <span
      className={`w-fit rounded-full border-2 border-ink px-3 py-0.5 font-display text-xs font-bold ${classe}`}
    >
      {rotulo}
    </span>
  );
}
