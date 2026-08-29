'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { CadastroInput, LoginInput } from '@/contracts-local';
import { obterAuthGateway } from '@/lib/auth';

const CHAVE_SESSAO = ['sessao'];

export function useSessao() {
  return useQuery({
    queryKey: CHAVE_SESSAO,
    queryFn: () => obterAuthGateway().obterSessao(),
    staleTime: Infinity,
  });
}

export function useCadastrar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CadastroInput) => obterAuthGateway().cadastrar(dados),
    onSuccess: (sessao) => queryClient.setQueryData(CHAVE_SESSAO, sessao),
  });
}

export function useEntrar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: LoginInput) => obterAuthGateway().entrar(dados),
    onSuccess: (sessao) => queryClient.setQueryData(CHAVE_SESSAO, sessao),
  });
}

export function useSair() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => obterAuthGateway().sair(),
    onSuccess: () => {
      queryClient.setQueryData(CHAVE_SESSAO, null);
      router.push('/login');
    },
  });
}
