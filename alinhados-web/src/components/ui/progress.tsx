import { cn } from '@/lib/utils';

interface ProgressProps {
  valor: number; // 0–100
  rotulo: string;
  className?: string;
}

/** Barra de progresso acessível — usada no indicador de completude do perfil (RF22). */
export function Progress({ valor, rotulo, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(valor)));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold text-paper">{rotulo}</span>
        <span className="font-display text-sm font-bold text-lime">{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={rotulo}
        className="h-4 w-full overflow-hidden rounded-full border-2 border-paper/30 bg-ink-soft"
      >
        <div
          className={cn('h-full rounded-full transition-all', clamped >= 100 ? 'bg-mint' : 'bg-lime')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
