'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { redefinirSenhaSchema, type RedefinirSenhaInput } from '@/contracts-local';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, inputClassName } from '@/components/ui/field';
import { AuthError, obterAuthGateway } from '@/lib/auth';

function FormularioRedefinir() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? undefined;
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RedefinirSenhaInput>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: { senha: '', confirmarSenha: '' },
  });

  async function onSubmit(dados: RedefinirSenhaInput) {
    setErro(null);
    setSalvando(true);
    try {
      await obterAuthGateway().redefinirSenha({ token, novaSenha: dados.senha });
      setSucesso(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (e) {
      setErro(
        e instanceof AuthError
          ? e.message
          : 'Não foi possível redefinir a senha. Tente novamente.',
      );
    } finally {
      setSalvando(false);
    }
  }

  if (sucesso) {
    return (
      <Card tone="lime" role="status" className="rotate-[-1deg]">
        <h1 className="font-display text-2xl font-bold">Senha redefinida! ✅</h1>
        <p className="mt-2">Levando você para o login…</p>
        <Link href="/login" className="mt-3 inline-block font-bold underline">
          Ir para o login agora
        </Link>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-bold">Definir nova senha</h1>

      <Field
        label="Nova senha"
        required
        error={errors.senha?.message}
        hint="Mínimo de 8 caracteres, com letras e números."
      >
        {(aria) => (
          <input
            {...aria}
            type="password"
            autoComplete="new-password"
            className={inputClassName}
            {...register('senha')}
          />
        )}
      </Field>

      <Field label="Confirmar nova senha" required error={errors.confirmarSenha?.message}>
        {(aria) => (
          <input
            {...aria}
            type="password"
            autoComplete="new-password"
            className={inputClassName}
            {...register('confirmarSenha')}
          />
        )}
      </Field>

      {erro && (
        <Card tone="tangerine" role="alert" className="py-3 text-sm font-semibold">
          {erro}{' '}
          <Link href="/recuperar-senha" className="underline">
            Solicitar novo link
          </Link>
        </Card>
      )}

      <Button type="submit" variant="primary" disabled={salvando}>
        {salvando ? 'Salvando…' : 'Salvar nova senha'}
      </Button>
    </form>
  );
}

export default function PaginaRedefinirSenha() {
  return (
    <Suspense
      fallback={
        <p role="status" className="text-center font-display text-paper/70">
          Carregando…
        </p>
      }
    >
      <FormularioRedefinir />
    </Suspense>
  );
}
