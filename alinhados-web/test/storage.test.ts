import { beforeEach, describe, expect, it } from 'vitest';
import type { PerfilBarbeariaInput, PerfilBarbeiroInput } from '@/contracts-local';
import {
  carregarPerfilBarbeariaLocal,
  carregarPerfilLocal,
  salvarPerfilBarbeariaLocal,
  salvarPerfilLocal,
} from '@/features/perfil/perfil-storage';
import {
  carregarGaleriaLocal,
  carregarTabelaServicosLocal,
  salvarGaleriaLocal,
  salvarTabelaServicosLocal,
} from '@/features/perfil/galeria';
import { carregarPortfolioLocal, salvarPortfolioLocal } from '@/features/perfil/portfolio';

const dadosBarbeiro = {
  nome: 'Gabriel Lima',
  bio: '',
  cidade: 'Barreiros',
  estado: 'PE',
  apelido_profissional: '',
  anos_experiencia: 5,
  servicos: ['Degradê'],
  cursos_formacao: [],
  comissao_desejada: 50,
  taxa_ocupacao: 80,
  recorde_meta: '',
  valores: [],
  esta_desempregado: false,
} as PerfilBarbeiroInput;

const dadosBarbearia = {
  nome: 'Brutal Cuts',
  bio: '',
  cidade: 'Sobra Nada',
  estado: 'SP',
  nome_decisor: 'Ale Wood',
  num_cadeiras: 4,
  num_unidades: 1,
  e_franquia: false,
  comissao_paga: 50,
  tem_fixo: false,
  tem_clube: false,
  descricao_clube: '',
  tem_pops: true,
  valores: [],
  esta_contratando: true,
} as PerfilBarbeariaInput;

describe('persistência local dos perfis', () => {
  beforeEach(() => localStorage.clear());

  it('salva e recarrega o perfil do barbeiro com foto e data', () => {
    salvarPerfilLocal('u1', { dados: dadosBarbeiro, fotoDataUrl: 'data:foto' });
    const salvo = carregarPerfilLocal('u1');
    expect(salvo?.dados.nome).toBe('Gabriel Lima');
    expect(salvo?.fotoDataUrl).toBe('data:foto');
    expect(salvo?.salvoEm).toBeTruthy();
  });

  it('salva e recarrega o perfil da barbearia, isolado por usuário', () => {
    salvarPerfilBarbeariaLocal('u1', { dados: dadosBarbearia, fotoDataUrl: 'data:logo' });
    expect(carregarPerfilBarbeariaLocal('u1')?.dados.nome).toBe('Brutal Cuts');
    expect(carregarPerfilBarbeariaLocal('u2')).toBeNull();
    expect(carregarPerfilLocal('u1')).toBeNull(); // chaves separadas por tipo
  });

  it('retorna null para dado corrompido em vez de quebrar', () => {
    localStorage.setItem('alinhados.perfil.u1', '{json quebrado');
    localStorage.setItem('alinhados.perfil-barbearia.u1', '{json quebrado');
    expect(carregarPerfilLocal('u1')).toBeNull();
    expect(carregarPerfilBarbeariaLocal('u1')).toBeNull();
  });
});

describe('persistência local de galeria, tabela e portfólio', () => {
  beforeEach(() => localStorage.clear());

  it('salva e recarrega a galeria da barbearia (E03)', () => {
    salvarGaleriaLocal('u1', ['data:1', 'data:2']);
    expect(carregarGaleriaLocal('u1')).toEqual(['data:1', 'data:2']);
    expect(carregarGaleriaLocal('u2')).toEqual([]);
  });

  it('salva, troca e remove a foto da tabela de serviços (RF30)', () => {
    salvarTabelaServicosLocal('u1', 'data:tabela');
    expect(carregarTabelaServicosLocal('u1')).toBe('data:tabela');
    salvarTabelaServicosLocal('u1', null);
    expect(carregarTabelaServicosLocal('u1')).toBeNull();
  });

  it('salva e recarrega o portfólio do barbeiro (B03)', () => {
    salvarPortfolioLocal('u1', ['data:corte1']);
    expect(carregarPortfolioLocal('u1')).toEqual(['data:corte1']);
  });

  it('galeria corrompida volta vazia em vez de quebrar', () => {
    localStorage.setItem('alinhados.galeria.u1', 'nao-e-json');
    expect(carregarGaleriaLocal('u1')).toEqual([]);
  });
});
