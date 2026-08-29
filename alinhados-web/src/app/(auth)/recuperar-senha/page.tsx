'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  solicitarRecuperacaoSchema,
  type SolicitarRecuperacaoInput,
} from '@/contracts-local';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, inputClassName } from '@/components/ui/field';
import { AuthError, obterAuthGateway } from '@/lib/auth';

export default function PaginaRecuperarSenha() {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [devLink, setDevLink] = useState<string | undefined>();
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SolicitarRecuperacaoInput>({
    resolver: zodResolver(solicitarRecuperacaoSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(dados: SolicitarRecuperacaoInput) {
    setErro(null);
    setEnviando(true);
    try {
      const resultado = await obterAuthGateway().solicitarRecuperacao(dados.email);
      setDevLink(resultado.devLink);
      setEnviado(true);
    } catch (e) {
      setErro(
        e instanceof AuthError ? e.message : 'Não foi possível enviar. Tente novamente.',
      );
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <Card tone="lime" role="status" className="rotate-[-1deg]">
        <h1 className="font-display text-2xl font-bold">Confira seu e-mail 📬</h1>
        <p className="mt-2">
          Enviamos um link para você definir uma nova senha. Ele expira em 15 minutos.
        </p>
        {devLink && (
          <p className="mt-3 rounded-xl border-2 border-ink bg-paper p-3 text-sm">
            <strong>Modo dev (sem e-mail configurado):</strong>{' '}
            <Link href={devLink} className="font-bold underline">
              abrir link de redefinição
            </Link>
          </p>
        )}
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Esqueceu a senha?</h1>
        <p className="mt-1 text-sm text-paper/70">
          Informe seu e-mail e enviaremos um link de recuperação.
        </p>
      </div>

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

      {erro && (
        <Card tone="tangerine" role="alert" className="py-3 text-sm font-semibold">
          {erro}
        </Card>
      )}

      <Button type="submit" variant="primary" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar link de recuperação'}
      </Button>

      <p className="text-center text-sm text-paper/70">
        Lembrou a senha?{' '}
        <Link href="/login" className="font-bold text-lime underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
