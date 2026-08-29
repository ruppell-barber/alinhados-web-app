import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function PaginaInicial() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-5 py-10">
      <Image
        src="/logo.png"
        alt="Alinhados"
        width={160}
        height={160}
        priority
        className="mx-auto rounded-2xl"
      />

      <Card tone="lime" className="rotate-[-1deg]">
        <h1 className="font-display text-3xl font-bold leading-tight">
          Conexões que geram alinhamento.
        </h1>
        <p className="mt-3 text-base">
          O Alinhados conecta barbeiros e barbearias que compartilham dos mesmos valores e
          objetivos.
        </p>
      </Card>

      <nav aria-label="Acesso" className="flex flex-col gap-3">
        <Link
          href="/cadastro"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-mint px-6 font-display text-base font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5"
        >
          Criar minha conta
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-paper px-6 font-display text-base font-bold text-paper transition-colors hover:bg-paper/10"
        >
          Já tenho conta
        </Link>
      </nav>
    </main>
  );
}
