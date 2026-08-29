/** Blocos visuais compartilhados pelo card do feed e pela tela de perfil completo. */

/** Formata reais sem centavos (valores do feed são aproximados). */
export function reais(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor);
}

export function Tags({ itens, tom }: { itens: string[]; tom: string }) {
  if (itens.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {itens.map((t) => (
        <li key={t} className={`rounded-full border-2 border-ink px-2.5 py-0.5 font-display text-xs font-bold ${tom}`}>
          {t}
        </li>
      ))}
    </ul>
  );
}

export function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b-2 border-paper/10 py-1.5">
      <span className="text-sm text-paper/60">{rotulo}</span>
      <span className="text-right font-display text-sm font-bold text-paper">{valor}</span>
    </div>
  );
}
