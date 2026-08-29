'use client';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface ContratacaoToggleProps {
  estaContratando: boolean;
  onChange: (estaContratando: boolean) => void;
  /** Nº de vagas abertas (E09) — a pausa sobrepõe as vagas (nota técnica E08). */
  vagasAbertas?: number;
}

/** Toggle "parei de contratar" (E08 — RF40/RN06). */
export function ContratacaoToggle({ estaContratando, onChange, vagasAbertas }: ContratacaoToggleProps) {
  return (
    <section
      aria-labelledby="secao-contratacao"
      className="flex flex-col gap-3 rounded-card border-2 border-grape p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="secao-contratacao" className="font-display text-lg font-bold text-grape">
          Contratação
        </h2>
        <span
          className={cn(
            'rounded-full border-2 border-ink px-3 py-0.5 font-display text-xs font-bold',
            estaContratando ? 'bg-mint text-ink' : 'bg-tangerine text-ink',
          )}
        >
          {estaContratando ? 'Contratando' : 'Pausado'}
        </span>
      </div>

      <Switch
        label="Estamos contratando"
        descricao="Desligue quando a vaga for preenchida — sua barbearia sai do feed dos barbeiros."
        checked={estaContratando}
        onChange={onChange}
      />

      {!estaContratando && (
        <p role="status" className="rounded-xl border-2 border-tangerine bg-ink-soft p-3 text-sm text-paper/90">
          Feed pausado: barbeiros não veem mais sua barbearia
          {vagasAbertas !== undefined && vagasAbertas > 0 && (
            <>
              {' '}
              — inclusive as <strong>{vagasAbertas} vaga(s) aberta(s)</strong>, que ficam ocultas
              enquanto a pausa durar
            </>
          )}
          . <strong>Alinhamentos e conversas ativos não são afetados.</strong>
        </p>
      )}
    </section>
  );
}
