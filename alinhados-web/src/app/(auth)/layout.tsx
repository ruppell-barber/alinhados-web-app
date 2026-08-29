import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8">
      <Link href="/" className="mx-auto" aria-label="Voltar para a página inicial">
        <Image src="/logo.png" alt="Alinhados" width={96} height={96} className="rounded-2xl" priority />
      </Link>
      {children}
    </div>
  );
}
