import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { KeyboardEvent } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Bloqueia teclas que o <input type="number"> aceita mas não são dígito válido:
 * notação científica ("e"/"E") e sinais ("+"/"-"). Passe permitirDecimal=true
 * para manter o separador decimal em campos de valor (R$).
 */
export function bloquearTeclasNaoNumericas(permitirDecimal = false) {
  return (evento: KeyboardEvent<HTMLInputElement>) => {
    const bloqueadas = permitirDecimal ? ['e', 'E', '+', '-'] : ['e', 'E', '+', '-', '.', ','];
    if (bloqueadas.includes(evento.key)) evento.preventDefault();
  };
}
