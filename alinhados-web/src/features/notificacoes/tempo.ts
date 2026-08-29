/** "há 2 min", "há 3 h", "há 2 d" — tempo relativo curto em pt-BR para as notificações. */
export function tempoRelativo(iso: string, agora = Date.now()): string {
  const diffMs = agora - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} d`;
}
