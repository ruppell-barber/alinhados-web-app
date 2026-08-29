'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { loginSchema, type LoginInput, type TipoUsuario } from '@/contracts-local';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, inputClassName } from '@/components/ui/field';
import { AuthError } from '@/lib/auth';
import { MOSTRAR_CONTAS_DEMO, entrarComoDemo } from '@/lib/dev/contas-demo';
import { useEntrar } from './use-sessao';

export function LoginForm() {
  const router = useRouter();
  const entrar = useEntrar();
  const queryClient = useQueryClient();
  const [demoCarregando, setDemoCarregando] = useState<TipoUsuario | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  function onSubmit(dados: LoginInput) {
    entrar.mutate(dados, {
      onSuccess: () => router.push('/perfil'),
    });
  }

  async function entrarDemo(tipo: TipoUsuario) {
    setDemoCarregando(tipo);
    try {
      const sessao = await entrarComoDemo(tipo);
      queryClient.setQueryData(['sessao'], sessao); // mesma chave do useSessao
      router.push('/perfil');
    } finally {
      setDemoCarregando(null);
    }
  }

  const mensagemErro =
    entrar.error instanceof AuthError
      ? entrar.error.message
      : entrar.isError
        ? 'Não foi possível entrar. Tente novamente.'
        : null;

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <h1 className="font-display text-2xl font-bold">Entrar</h1>

        <Field label="E-mail" required error={errors.email?.message}>
          {(aria) => (
            <input
              {...aria}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="voce@exemplo.com"
              className={inputClassName}
              {...register('email')}
            />
          )}
        </Field>

        <Field label="Senha" required error={errors.senha?.message}>
          {(aria) => (
            <input
              {...aria}
              type="password"
              autoComplete="current-password"
              className={inputClassName}
              {...register('senha')}
            />
          )}
        </Field>

        {mensagemErro && (
          <Card tone="tangerine" role="alert" className="py-3 text-sm font-semibold">
            {mensagemErro}
          </Card>
        )}

        <Button type="submit" variant="primary" disabled={entrar.isPending}>
          {entrar.isPending ? 'Entrando…' : 'Entrar'}
        </Button>

        <p className="text-center text-sm">
          <Link
            href="/recuperar-senha"
            className="font-bold text-paper/80 underline-offset-4 hover:text-lime hover:underline"
          >
            Esqueci minha senha
          </Link>
        </p>

        <p className="text-center text-sm text-paper/70">
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="font-bold text-lime underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </p>
      </form>

      {MOSTRAR_CONTAS_DEMO && (
        <div className="flex flex-col gap-2 rounded-card border-2 border-dashed border-paper/25 p-4">
          <p className="text-center text-xs font-bold uppercase tracking-wide text-paper/50">
            Atalhos de teste (modo dev)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => entrarDemo('barbeiro')}
              disabled={demoCarregando !== null}
              className="flex-1 rounded-full border-2 border-paper/40 py-2.5 font-display text-sm font-bold text-paper hover:border-lime hover:text-lime disabled:opacity-50"
            >
              {demoCarregando === 'barbeiro' ? 'Entrando…' : 'Barbeiro demo'}
            </button>
            <button
              type="button"
              onClick={() => entrarDemo('barbearia')}
              disabled={demoCarregando !== null}
              className="flex-1 rounded-full border-2 border-paper/40 py-2.5 font-display text-sm font-bold text-paper hover:border-lime hover:text-lime disabled:opacity-50"
            >
              {demoCarregando === 'barbearia' ? 'Entrando…' : 'Barbearia demo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
