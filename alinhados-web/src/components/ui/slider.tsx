'use client';

import { useState } from 'react';

interface SliderProps {
  id?: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (valor: number) => void;
  formatarValor?: (valor: number) => string;
  infoTexto?: string;
  error?: string;
}

/**
 * Slider acessível com valor visível e botão de informação (?) opcional (RF26).
 * Usa input[type=range] nativo: teclado e leitores de tela de graça (RNF13).
 */
export function Slider({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatarValor = (v) => String(v),
  infoTexto,
  error,
}: SliderProps) {
  const [infoAberta, setInfoAberta] = useState(false);
  const sliderId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  const infoId = `${sliderId}-info`;
  const erroId = `${sliderId}-erro`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={sliderId} className="font-display text-sm font-bold text-paper">
          {label}
          {infoTexto && (
            <button
              type="button"
              onClick={() => setInfoAberta((aberta) => !aberta)}
              aria-expanded={infoAberta}
              aria-controls={infoId}
              aria-label={`Mais informações sobre ${label}`}
              className="ml-2 inline-flex size-6 items-center justify-center rounded-full border-2 border-paper/40 text-xs text-paper/80 hover:border-lime hover:text-lime"
            >
              ?
            </button>
          )}
        </label>
        <output htmlFor={sliderId} className="rounded-full bg-lime px-3 py-0.5 font-display text-sm font-bold text-ink">
          {formatarValor(value)}
        </output>
      </div>

      {infoTexto && infoAberta && (
        <p id={infoId} className="rounded-xl border-2 border-grape bg-ink-soft p-3 text-sm text-paper/90">
          {infoTexto}
        </p>
      )}

      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-describedby={error ? erroId : undefined}
        aria-invalid={Boolean(error)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-paper/20 accent-lime"
      />
      <div className="flex justify-between text-xs text-paper/60">
        <span>{formatarValor(min)}</span>
        <span>{formatarValor(max)}</span>
      </div>

      {error && (
        <p id={erroId} role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
