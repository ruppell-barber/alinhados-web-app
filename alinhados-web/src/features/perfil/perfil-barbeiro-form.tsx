'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LIMITES,
  perfilBarbeiroSchema,
  UFS,
  type PerfilBarbeiroInput,
} from '@/contracts-local';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, inputClassName } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { TagInput } from '@/components/ui/tag-input';
import { bloquearTeclasNaoNumericas } from '@/lib/utils';
import { calcularCompletude } from './completude';
import { FotoPerfilInput } from './foto-perfil-input';
import { fotoParaDataUrl, type PerfilSalvo } from './perfil-storage';

const SUGESTOES_SERVICOS = ['Degradê', 'Barba', 'Navalhado', 'Sobrancelha', 'Pigmentação', 'Luzes'];
const SUGESTOES_VALORES = ['Pontualidade', 'Organização', 'Trabalho em equipe', 'Ambição', 'Respeito', 'Criatividade'];

interface PerfilBarbeiroFormProps {
  /** Perfil já salvo — pré-preenche o formulário no modo edição. */
  inicial?: PerfilSalvo | null;
  onSalvar: (dados: PerfilBarbeiroInput, fotoDataUrl: string) => Promise<void> | void;
}

export function PerfilBarbeiroForm({ inicial, onSalvar }: PerfilBarbeiroFormProps) {
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
  } = useForm<PerfilBarbeiroInput>({
    resolver: zodResolver(perfilBarbeiroSchema),
    defaultValues: inicial?.dados ?? {
      nome: '',
      bio: '',
      cidade: '',
      apelido_profissional: '',
      servicos: [],
      cursos_formacao: [],
      valores: [],
      recorde_meta: '',
      esta_desempregado: false,
      comissao_desejada: 50,
      taxa_ocupacao: 0,
    },
    mode: 'onBlur',
  });

  const dados = watch();
  const temFoto = Boolean(foto) || Boolean(inicial?.fotoDataUrl);
  const completude = calcularCompletude(dados, temFoto);

  async function onSubmit(valores: PerfilBarbeiroInput) {
    if (!temFoto) {
      setErroFoto('A foto de perfil é obrigatória.'); // RF21
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
          Perfis completos aparecem primeiro para as barbearias. Você pode editar quando quiser.
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

      <Field label="Nome completo" required error={errors.nome?.message}>
        {(aria) => (
          <input {...aria} type="text" autoComplete="name" className={inputClassName} {...register('nome')} />
        )}
      </Field>

      <Field label="Apelido profissional" error={errors.apelido_profissional?.message} hint="Como você é conhecido na cadeira (opcional).">
        {(aria) => (
          <input {...aria} type="text" className={inputClassName} {...register('apelido_profissional')} />
        )}
      </Field>

      <Field label="Minibio" error={errors.bio?.message} hint="Conte em poucas linhas seu estilo e sua vibe de trabalho.">
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
            <select {...aria} className={inputClassName} defaultValue="" {...register('estado')}>
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

      <Field label="Tempo de mercado (anos)" required error={errors.anos_experiencia?.message}>
        {(aria) => (
          <input
            {...aria}
            type="number"
            inputMode="numeric"
            onKeyDown={bloquearTeclasNaoNumericas()}
            min={0}
            max={70}
            className={inputClassName}
            {...register('anos_experiencia', { valueAsNumber: true })}
          />
        )}
      </Field>

      <Field label="Serviços" required error={errors.servicos?.message} hint="O que você domina na cadeira.">
        {(aria) => (
          <Controller
            control={control}
            name="servicos"
            render={({ field }) => (
              <TagInput
                id={aria.id}
                aria-invalid={aria['aria-invalid']}
                aria-describedby={aria['aria-describedby']}
                valores={field.value}
                onChange={field.onChange}
                sugestoes={SUGESTOES_SERVICOS}
                tom="grape"
                placeholder="Ex.: Degradê, barba…"
              />
            )}
          />
        )}
      </Field>

      <Field label="Cursos e formações" error={errors.cursos_formacao?.message} hint="Adicione cursos que fortalecem seu perfil.">
        {(aria) => (
          <Controller
            control={control}
            name="cursos_formacao"
            render={({ field }) => (
              <TagInput
                id={aria.id}
                valores={field.value ?? []}
                onChange={field.onChange}
                tom="tangerine"
                placeholder="Ex.: Visagismo, barboterapia…"
              />
            )}
          />
        )}
      </Field>

      {/* RF18 — critério de aceite da B01 */}
      <Field
        label="Recorde de meta"
        error={errors.recorde_meta?.message}
        hint="Sua maior marca na cadeira — ex.: 'R$ 12 mil num mês' ou '90 cortes numa semana'."
      >
        {(aria) => (
          <input {...aria} type="text" maxLength={200} className={inputClassName} {...register('recorde_meta')} />
        )}
      </Field>

      <Field
        label="Seus valores"
        error={errors.valores?.message}
        hint={`Escolha até ${LIMITES.MAX_VALORES} — barbearias buscam quem compartilha dos mesmos valores.`}
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

      {/* B02 — Comissão e ocupação (RF14/RF15/RF16/RF26) */}
      <section aria-labelledby="secao-comissao" className="flex flex-col gap-5 rounded-card border-2 border-grape p-4">
        <h2 id="secao-comissao" className="font-display text-lg font-bold text-grape">
          Comissão e ocupação
        </h2>

        <Controller
          control={control}
          name="comissao_desejada"
          render={({ field }) => (
            <Slider
              id="comissao-desejada"
              label="Comissão desejada"
              min={LIMITES.COMISSAO_MIN}
              max={LIMITES.COMISSAO_MAX}
              value={field.value}
              onChange={field.onChange}
              formatarValor={(v) => `${v}%`}
              error={errors.comissao_desejada?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="taxa_ocupacao"
          render={({ field }) => (
            <Slider
              id="taxa-ocupacao"
              label="Taxa de ocupação"
              min={LIMITES.OCUPACAO_MIN}
              max={LIMITES.OCUPACAO_MAX}
              step={5}
              value={field.value}
              onChange={field.onChange}
              formatarValor={(v) => `${v}%`}
              infoTexto="Taxa de ocupação é o quanto da sua agenda está preenchida hoje. Agenda lotada = 100%; metade dos horários vagos = 50%."
              error={errors.taxa_ocupacao?.message}
            />
          )}
        />

        <Field
          label="Faturamento mensal (R$)"
          error={errors.faturamento_mensal?.message}
          hint="Opcional — seu faturamento médio por mês. Barbearias valorizam transparência."
        >
          {(aria) => (
            <input
              {...aria}
              type="number"
              inputMode="decimal"
              onKeyDown={bloquearTeclasNaoNumericas(true)}
              min={1}
              step={100}
              placeholder="Ex.: 6000"
              className={inputClassName}
              {...register('faturamento_mensal', {
                setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
              })}
            />
          )}
        </Field>
      </section>

      <label className="flex cursor-pointer items-center gap-3 rounded-card border-2 border-paper/30 bg-ink-soft p-4">
        <input type="checkbox" className="size-5 accent-lime" {...register('esta_desempregado')} />
        <span className="text-sm font-semibold text-paper">
          Estou sem barbearia no momento (disponibilidade imediata)
        </span>
      </label>

      {!watch('esta_desempregado') && (
        <Field label="Barbearia atual" error={errors.barbearia_atual?.message} hint="Opcional — controle sua visibilidade no perfil.">
          {(aria) => (
            <input {...aria} type="text" className={inputClassName} {...register('barbearia_atual')} />
          )}
        </Field>
      )}

      <Button type="submit" variant="primary" disabled={salvando}>
        {salvando ? 'Salvando…' : 'Salvar perfil'}
      </Button>
    </form>
  );
}
