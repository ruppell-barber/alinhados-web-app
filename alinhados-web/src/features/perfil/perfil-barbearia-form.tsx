'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LIMITES,
  perfilBarbeariaSchema,
  UFS,
  type PerfilBarbeariaInput,
} from '@/contracts-local';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, inputClassName } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { TagInput } from '@/components/ui/tag-input';
import { bloquearTeclasNaoNumericas } from '@/lib/utils';
import { calcularCompletudeBarbearia } from './completude-barbearia';
import { FotoPerfilInput } from './foto-perfil-input';
import { fotoParaDataUrl, type PerfilBarbeariaSalvo } from './perfil-storage';

const SUGESTOES_VALORES = ['Pontualidade', 'Organização', 'Trabalho em equipe', 'Ambição', 'Respeito', 'Criatividade'];

interface PerfilBarbeariaFormProps {
  inicial?: PerfilBarbeariaSalvo | null;
  /** Estado da galeria/tabela (E03) — entram na completude (RN01). */
  galeriaCompleta?: boolean;
  temTabelaServicos?: boolean;
  onSalvar: (dados: PerfilBarbeariaInput, fotoDataUrl: string) => Promise<void> | void;
}

export function PerfilBarbeariaForm({
  inicial,
  galeriaCompleta = false,
  temTabelaServicos = false,
  onSalvar,
}: PerfilBarbeariaFormProps) {
  const [foto, setFoto] = useState<File | null>(null);
  const [erroFoto, setErroFoto] = useState<string | undefined>();
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PerfilBarbeariaInput>({
    resolver: zodResolver(perfilBarbeariaSchema),
    defaultValues: inicial?.dados ?? {
      nome: '',
      bio: '',
      cidade: '',
      nome_decisor: '',
      e_franquia: false,
      valores: [],
      // Campos de comissão/fixo/modelo ganham UI na E02 — defaults válidos.
      comissao_paga: 50,
      tem_fixo: false,
      descricao_clube: '',
      tem_clube: false,
      tem_pops: false,
      esta_contratando: true,
    },
    mode: 'onBlur',
  });

  const dados = watch();
  const temFoto = Boolean(foto) || Boolean(inicial?.fotoDataUrl);
  const completude = calcularCompletudeBarbearia(dados, temFoto, galeriaCompleta, temTabelaServicos);

  async function onSubmit(valores: PerfilBarbeariaInput) {
    if (!temFoto) {
      setErroFoto('A foto da barbearia é obrigatória.');
      return;
    }
    setSalvando(true);
    try {
      const fotoDataUrl = foto ? await fotoParaDataUrl(foto) : inicial!.fotoDataUrl;
      await onSalvar(valores, fotoDataUrl);
      setSalvo(true);
    } finally {
      setSalvando(false);
    }
  }

  if (salvo) {
    return (
      <Card tone="lime" role="status" className="rotate-[-1deg]">
        <h2 className="font-display text-2xl font-bold">Perfil salvo! 🎉</h2>
        <p className="mt-2">
          Perfis completos aparecem primeiro para os barbeiros. Complete a galeria para chegar a 100%.
        </p>
        <a
          href="/perfil"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink bg-ink px-5 font-display text-sm font-bold text-paper"
        >
          Voltar ao meu perfil
        </a>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <Progress valor={completude} rotulo="Completude do perfil" />

      <FotoPerfilInput
        previewInicial={inicial?.fotoDataUrl}
        onChange={(arquivo) => {
          setFoto(arquivo);
          if (arquivo) setErroFoto(undefined);
        }}
        error={erroFoto}
      />

      <Field label="Nome da barbearia" required error={errors.nome?.message}>
        {(aria) => (
          <input {...aria} type="text" autoComplete="organization" className={inputClassName} {...register('nome')} />
        )}
      </Field>

      <Field
        label="Nome do decisor"
        required
        error={errors.nome_decisor?.message}
        hint="Quem conversa e decide as contratações."
      >
        {(aria) => (
          <input {...aria} type="text" autoComplete="name" className={inputClassName} {...register('nome_decisor')} />
        )}
      </Field>

      <Field label="Sobre a barbearia" error={errors.bio?.message} hint="Conte a vibe da casa, o público e o que valorizam.">
        {(aria) => (
          <textarea
            {...aria}
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border-2 border-paper/30 bg-ink-soft p-4 text-base text-paper placeholder:text-paper/40 focus:border-lime aria-[invalid=true]:border-danger"
            {...register('bio')}
          />
        )}
      </Field>

      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <Field label="Cidade" required error={errors.cidade?.message}>
          {(aria) => (
            <input {...aria} type="text" autoComplete="address-level2" className={inputClassName} {...register('cidade')} />
          )}
        </Field>

        <Field label="Estado" required error={errors.estado?.message}>
          {(aria) => (
            <select {...aria} className={inputClassName} defaultValue={inicial?.dados.estado ?? ''} {...register('estado')}>
              <option value="" disabled>
                UF
              </option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cadeiras" required error={errors.num_cadeiras?.message}>
          {(aria) => (
            <input
              {...aria}
              type="number"
              inputMode="numeric"
              onKeyDown={bloquearTeclasNaoNumericas()}
              min={1}
              max={200}
              className={inputClassName}
              {...register('num_cadeiras', { valueAsNumber: true })}
            />
          )}
        </Field>

        <Field label="Unidades" required error={errors.num_unidades?.message}>
          {(aria) => (
            <input
              {...aria}
              type="number"
              inputMode="numeric"
              onKeyDown={bloquearTeclasNaoNumericas()}
              min={1}
              max={500}
              className={inputClassName}
              {...register('num_unidades', { valueAsNumber: true })}
            />
          )}
        </Field>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-card border-2 border-paper/30 bg-ink-soft p-4">
        <input type="checkbox" className="size-5 accent-lime" {...register('e_franquia')} />
        <span className="text-sm font-semibold text-paper">Somos uma franquia</span>
      </label>

      {/* E02 — Comissão, fixo e modelo (RF33/RF34/RF35/RF36) */}
      <section aria-labelledby="secao-modelo" className="flex flex-col gap-5 rounded-card border-2 border-grape p-4">
        <h2 id="secao-modelo" className="font-display text-lg font-bold text-grape">
          Comissão, fixo e modelo
        </h2>

        <Controller
          control={control}
          name="comissao_paga"
          render={({ field }) => (
            <Slider
              id="comissao-paga"
              label="Comissão paga"
              min={LIMITES.COMISSAO_MIN}
              max={LIMITES.COMISSAO_MAX}
              value={field.value}
              onChange={field.onChange}
              formatarValor={(v) => `${v}%`}
              error={errors.comissao_paga?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="tem_fixo"
          render={({ field }) => (
            <Switch
              label="Oferecemos fixo de segurança"
              descricao="Valor garantido por mês, independente da comissão."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {watch('tem_fixo') && (
          <Field label="Valor do fixo (R$)" required error={errors.valor_fixo?.message}>
            {(aria) => (
              <input
                {...aria}
                type="number"
                inputMode="decimal"
                onKeyDown={bloquearTeclasNaoNumericas(true)}
                min={1}
                step={100}
                placeholder="Ex.: 1600"
                className={inputClassName}
                {...register('valor_fixo', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
              />
            )}
          </Field>
        )}

        <Controller
          control={control}
          name="tem_clube"
          render={({ field }) => (
            <Switch
              label="Temos clube de assinatura"
              descricao="Clientes assinantes garantem recorrência pro barbeiro."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {watch('tem_clube') && (
          <Field label="Como funciona o clube" required error={errors.descricao_clube?.message}>
            {(aria) => (
              <textarea
                {...aria}
                rows={2}
                maxLength={300}
                placeholder="Ex.: assinatura mensal com cortes ilimitados…"
                className="w-full rounded-xl border-2 border-paper/30 bg-ink-soft p-4 text-base text-paper placeholder:text-paper/40 focus:border-lime aria-[invalid=true]:border-danger"
                {...register('descricao_clube')}
              />
            )}
          </Field>
        )}

        <Controller
          control={control}
          name="tem_pops"
          render={({ field }) => (
            <Switch
              label="Trabalhamos com POPs"
              descricao="Procedimentos operacionais padrão documentados."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </section>

      <Field
        label="Valores da casa"
        error={errors.valores?.message}
        hint={`Escolha até ${LIMITES.MAX_VALORES} — barbeiros buscam casas que compartilham dos mesmos valores.`}
      >
        {(aria) => (
          <Controller
            control={control}
            name="valores"
            render={({ field }) => (
              <TagInput
                id={aria.id}
                aria-invalid={aria['aria-invalid']}
                aria-describedby={aria['aria-describedby']}
                valores={field.value}
                onChange={field.onChange}
                sugestoes={SUGESTOES_VALORES}
                maximo={LIMITES.MAX_VALORES}
                tom="lime"
              />
            )}
          />
        )}
      </Field>

      <Button type="submit" variant="primary" disabled={salvando}>
        {salvando ? 'Salvando…' : 'Salvar perfil'}
      </Button>
    </form>
  );
}
