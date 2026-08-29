import type {
  PerfilBarbeariaInput,
  PerfilBarbeiroInput,
  Sessao,
  TipoUsuario,
} from '@/contracts-local';
import { obterAuthGateway } from '@/lib/auth';
import { salvarPerfilBarbeariaLocal, salvarPerfilLocal } from '@/features/perfil/perfil-storage';

/**
 * Contas de teste prontas (modo mock) — para não precisar cadastrar a cada teste.
 * Só faz sentido sem Supabase configurado; a UI esconde os atalhos quem tem auth real.
 * CPF/CNPJ são os números de teste válidos por dígito verificador.
 */

const SENHA_DEMO = 'demo1234';
const CPF_DEMO = '111.444.777-35';
const CNPJ_DEMO = '11.222.333/0001-81';

function fotoDemo(cor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="${cor}"/><text x="50%" y="50%" font-family="sans-serif" font-size="90" text-anchor="middle" dominant-baseline="middle">💈</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const BARBEIRO_DEMO = {
  email: 'barbeiro.demo@alinhados.com',
  foto: fotoDemo('#c6f24e'),
  perfil: {
    nome: 'Barbeiro Demo',
    bio: 'Conta de teste para desenvolvimento.',
    cidade: 'São Paulo',
    estado: 'SP',
    apelido_profissional: 'Demo',
    anos_experiencia: 6,
    servicos: ['Degradê', 'Barba'],
    cursos_formacao: ['Visagismo'],
    comissao_desejada: 50,
    faturamento_mensal: 6000,
    taxa_ocupacao: 50,
    recorde_meta: 'R$ 10 mil num mês',
    valores: ['Pontualidade', 'Organização'],
    barbearia_atual: null,
    esta_desempregado: true,
  } satisfies PerfilBarbeiroInput,
};

const BARBEARIA_DEMO = {
  email: 'barbearia.demo@alinhados.com',
  foto: fotoDemo('#b39cf9'),
  perfil: {
    nome: 'Barbearia Demo',
    bio: 'Conta de teste para desenvolvimento.',
    cidade: 'São Paulo',
    estado: 'SP',
    nome_decisor: 'Gerente Demo',
    num_cadeiras: 4,
    num_unidades: 1,
    e_franquia: false,
    comissao_paga: 50,
    tem_fixo: true,
    valor_fixo: 1500,
    tem_clube: false,
    descricao_clube: '',
    tem_pops: false,
    faturamento_medio: 40000,
    valores: ['Ambiente familiar'],
    esta_contratando: true,
    vagas_abertas: 2,
  } satisfies PerfilBarbeariaInput,
};

/**
 * Atalhos demo aparecem SÓ no ambiente de desenvolvimento do RJ: fora de produção
 * e sem Supabase configurado. Num build de produção (o que o time testaria) somem.
 */
export const MOSTRAR_CONTAS_DEMO =
  process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Entra com a conta de teste do tipo escolhido, criando-a (com perfil completo) na primeira vez.
 * Retorna a sessão para o chamador atualizar o cache de sessão.
 */
export async function entrarComoDemo(tipo: TipoUsuario): Promise<Sessao> {
  const gateway = obterAuthGateway();
  const conf = tipo === 'barbeiro' ? BARBEIRO_DEMO : BARBEARIA_DEMO;
  const documento = tipo === 'barbeiro' ? CPF_DEMO : CNPJ_DEMO;

  let sessao: Sessao;
  try {
    sessao = await gateway.entrar({ email: conf.email, senha: SENHA_DEMO });
  } catch {
    // Ainda não existe: cria a conta.
    sessao = await gateway.cadastrar({
      email: conf.email,
      senha: SENHA_DEMO,
      confirmarSenha: SENHA_DEMO,
      tipo,
      documento,
    });
  }

  // Garante o perfil completo salvo (idempotente — sobrescreve com o demo).
  if (tipo === 'barbeiro') {
    salvarPerfilLocal(sessao.usuarioId, { dados: BARBEIRO_DEMO.perfil, fotoDataUrl: BARBEIRO_DEMO.foto });
  } else {
    salvarPerfilBarbeariaLocal(sessao.usuarioId, {
      dados: BARBEARIA_DEMO.perfil,
      fotoDataUrl: BARBEARIA_DEMO.foto,
    });
  }

  return sessao;
}
