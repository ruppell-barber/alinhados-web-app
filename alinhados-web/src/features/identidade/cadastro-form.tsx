'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  cadastroSchema,
  formatarCnpj,
  formatarCpf,
  type CadastroInput,
} from '@/contracts-local';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, inputClassName } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { AuthError } from '@/lib/auth';
import { useCadastrar } from './use-sessao';

const tipos = [
  { valor: 'barbeiro', titulo: 'Sou barbeiro', descricao: 'Quero encontrar uma barbearia alinhada comigo' },
  { valor: 'barbearia', titulo: 'Sou barbearia', descricao: 'Quero encontrar barbeiros alinhados com a casa' },
] as const;

export function CadastroForm() {
  const router = useRouter();
  const cadastrar = useCadastrar();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { tipo: 'barbeiro', email: '', senha: '', confirmarSenha: '', documento: '' },
  });

  const tipo = watch('tipo');
  const rotuloDocumento = tipo === 'barbeiro' ? 'CPF' : 'CNPJ';
  const formatarDocumento = tipo === 'barbeiro' ? formatarCpf : formatarCnpj;

  function onSubmit(dados: CadastroInput) {
    cadastrar.mutate(dados, {
      onSuccess: () => router.push('/perfil'),
    });
  }

  const mensagemErro =
    cadastrar.error instanceof AuthError
      ? cadastrar.error.message
      : cadastrar.isError
        ? 'Não foi possível concluir o cadastro. Tente novamente.'
        : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-bold">Criar minha conta</h1>

      {/* Seleção de tipo (barbeiro/barbearia) — RF09 */}
      <Controller
        control={control}
        name="tipo"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-display text-sm font-bold text-paper">
              Como você quer usar o Alinhados?
            </legend>
            {tipos.map((opcao) => (
              <label
                key={opcao.valor}
                className={cn(
                  'cursor-pointer rounded-card border-2 p-4 transition-colors',
                  field.value === opcao.valor
                    ? 'border-lime bg-lime text-ink'
                    : 'border-paper/30 bg-ink-soft text-paper hover:border-paper/60',
                )}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={opcao.valor}
                  checked={field.value === opcao.valor}
                  onChange={() => {
                    field.onChange(opcao.valor);
                    setValue('documento', '');
                  }}
                  className="sr-only"
                />
                <span className="block font-display text-base font-bold">{opcao.titulo}</span>
                <span className={cn('text-sm', field.value === opcao.valor ? 'text-ink/80' : 'text-paper/70')}>
                  {opcao.descricao}
                </span>
              </label>
            ))}
          </fieldset>
        )}
      />

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

      <Field
        label={rotuloDocumento}
        required
        error={errors.documento?.message}
        hint={tipo === 'barbearia' ? 'Usado só na verificação — nunca aparece no seu perfil.' : undefined}
      >
        {(aria) => (
          <Controller
            control={control}
            name="documento"
            render={({ field }) => (
              <input
                {...aria}
                type="text"
                inputMode="numeric"
                placeholder={tipo === 'barbeiro' ? '000.000.000-00' : '00.000.000/0000-00'}
                className={inputClassName}
                value={field.value}
                onChange={(e) => field.onChange(formatarDocumento(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
        )}
      </Field>

      <Field
        label="Senha"
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

      <Field label="Confirmar senha" required error={errors.confirmarSenha?.message}>
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

      {mensagemErro && (
        <Card tone="tangerine" role="alert" className="py-3 text-sm font-semibold">
          {mensagemErro}
        </Card>
      )}

      <Button type="submit" variant="primary" disabled={cadastrar.isPending}>
        {cadastrar.isPending ? 'Criando conta…' : 'Criar conta'}
      </Button>
    </form>
  );
}
