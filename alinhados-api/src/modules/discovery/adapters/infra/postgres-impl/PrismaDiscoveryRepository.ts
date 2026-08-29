import { injectable } from 'tsyringe';
import { Prisma, Swipe } from '@prisma/client';
import { prisma } from '../../../../../shared/infra/database/prisma';
import {
  IDiscoveryRepository,
  ViewerInfo,
  CardBarbeiro,
  CardBarbearia,
  FeedPaginacao,
  PerfilBarbeiro,
  PerfilBarbearia,
  FotoPerfil,
  SwipeRegistrado,
  RegistrarSwipeRepositoryInput,
} from '../../../application/ports/IDiscoveryRepository';

/** Prisma devolve `Decimal` (ou string) para colunas monetárias; normaliza para `number` de exibição. */
function decimalParaNumero(valor: unknown): number | null {
  return valor === null || valor === undefined ? null : Number(valor);
}

function paraSwipeRegistrado(swipe: Swipe): SwipeRegistrado {
  return {
    id: swipe.id,
    swiperId: swipe.swiper_id,
    swipedId: swipe.swiped_id,
    direction: swipe.direction,
    createdAt: swipe.created_at,
  };
}

@injectable()
export class PrismaDiscoveryRepository implements IDiscoveryRepository {
  async obterViewer(viewerId: string): Promise<ViewerInfo | null> {
    const perfil = await prisma.perfil.findUnique({
      where: { id: viewerId },
      select: { id: true, user_type: true, cidade: true, estado: true },
    });
    if (!perfil) return null;

    return {
      id: perfil.id,
      user_type: perfil.user_type as 'barbeiro' | 'barbearia',
      cidade: perfil.cidade,
      estado: perfil.estado,
    };
  }

  async buscarFeedBarbeiros(viewer: ViewerInfo, { page, pageSize }: FeedPaginacao): Promise<CardBarbeiro[]> {
    const offset = (page - 1) * pageSize;

    // Query crua: o "mesma cidade primeiro" (RN03) precisa de ORDER BY sobre uma expressão booleana,
    // que o query builder do Prisma não expressa. O índice em profiles(user_type, status, estado,
    // cidade) cobre o filtro (RNF01). Exclusão de já-vistos por NOT EXISTS na tabela swipes (RN04).
    //
    // Status elegível: só 'disponivel' — é o status ativo do barbeiro. ('aberto' é o status ativo da
    // BARBEARIA, usado no feed inverso B04.) NÃO filtramos por `esta_desempregado`: o barbeiro empregado
    // continua no feed se estiver 'disponivel' (B09/RN05 — visível mesmo empregado; fora do feed só quem
    // está indisponivel/pausado/banido). O `esta_desempregado` vai no card como sinal informativo.
    const cards = await prisma.$queryRaw<CardBarbeiro[]>`
      SELECT p.id, p.nome, p.avatar_url, p.cidade, p.estado,
             bd.servicos, bd.valores, bd.taxa_ocupacao, bd.comissao_desejada, bd.esta_desempregado
      FROM profiles p
      JOIN barbeiro_details bd ON bd.profile_id = p.id
      WHERE p.user_type = 'barbeiro'
        AND p.is_complete = true
        AND p.status = 'disponivel'
        AND p.estado = ${viewer.estado}
        AND NOT EXISTS (
          SELECT 1 FROM swipes s
          WHERE s.swiper_id = ${viewer.id}::uuid AND s.swiped_id = p.id
        )
      ORDER BY (p.cidade = ${viewer.cidade}) DESC, p.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    return cards;
  }

  async buscarFeedBarbearias(viewer: ViewerInfo, { page, pageSize }: FeedPaginacao): Promise<CardBarbearia[]> {
    const offset = (page - 1) * pageSize;

    // Espelho de `buscarFeedBarbeiros`, invertendo o lado (RN02). Status elegível: só 'aberto' — é o
    // status ativo da barbearia (contratando). RN06 ("parei de contratar") tira a barbearia do 'aberto',
    // então some do feed. `valor_fixo` é Decimal no banco; convertido para float8 para virar number no
    // card (é valor de exibição, não cálculo financeiro).
    const cards = await prisma.$queryRaw<CardBarbearia[]>`
      SELECT p.id, p.nome, p.avatar_url, p.cidade, p.estado,
             bd.num_cadeiras, bd.comissao_paga, bd.tem_fixo, bd.valor_fixo::float8 AS valor_fixo, bd.valores
      FROM profiles p
      JOIN barbearia_details bd ON bd.profile_id = p.id
      WHERE p.user_type = 'barbearia'
        AND p.is_complete = true
        AND p.status = 'aberto'
        AND p.estado = ${viewer.estado}
        AND NOT EXISTS (
          SELECT 1 FROM swipes s
          WHERE s.swiper_id = ${viewer.id}::uuid AND s.swiped_id = p.id
        )
      ORDER BY (p.cidade = ${viewer.cidade}) DESC, p.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    return cards;
  }

  async obterPerfilBarbeiro(barbeiroId: string): Promise<PerfilBarbeiro | null> {
    const p = await prisma.perfil.findUnique({
      where: { id: barbeiroId },
      include: { barbeiro_details: true, photos: { orderBy: { ordem: 'asc' } } },
    });
    // Só retorna se for realmente um barbeiro com detalhes preenchidos.
    if (!p || p.user_type !== 'barbeiro' || !p.barbeiro_details) return null;

    const bd = p.barbeiro_details;
    return {
      id: p.id,
      nome: p.nome,
      avatar_url: p.avatar_url,
      cidade: p.cidade,
      estado: p.estado,
      apelido_profissional: bd.apelido_profissional,
      anos_experiencia: bd.anos_experiencia,
      servicos: bd.servicos,
      cursos_formacao: bd.cursos_formacao,
      comissao_desejada: bd.comissao_desejada,
      faturamento_mensal: decimalParaNumero(bd.faturamento_mensal),
      taxa_ocupacao: bd.taxa_ocupacao,
      recorde_meta: bd.recorde_meta,
      valores: bd.valores,
      barbearia_atual: bd.barbearia_atual,
      esta_desempregado: bd.esta_desempregado,
      fotos: mapearFotos(p.photos),
      // cpf_hash é deliberadamente omitido (documento, RN de privacidade).
    };
  }

  async obterPerfilBarbearia(barbeariaId: string): Promise<PerfilBarbearia | null> {
    const p = await prisma.perfil.findUnique({
      where: { id: barbeariaId },
      include: { barbearia_details: true, photos: { orderBy: { ordem: 'asc' } } },
    });
    if (!p || p.user_type !== 'barbearia' || !p.barbearia_details) return null;

    const bd = p.barbearia_details;
    return {
      id: p.id,
      nome: p.nome,
      avatar_url: p.avatar_url,
      cidade: p.cidade,
      estado: p.estado,
      nome_decisor: bd.nome_decisor,
      num_cadeiras: bd.num_cadeiras,
      vagas_abertas: bd.vagas_abertas,
      comissao_paga: bd.comissao_paga,
      tem_fixo: bd.tem_fixo,
      valor_fixo: decimalParaNumero(bd.valor_fixo),
      tem_clube: bd.tem_clube,
      descricao_clube: bd.descricao_clube,
      tem_pops: bd.tem_pops,
      num_unidades: bd.num_unidades,
      e_franquia: bd.e_franquia,
      faturamento_medio: decimalParaNumero(bd.faturamento_medio),
      valores: bd.valores,
      esta_contratando: bd.esta_contratando,
      fotos: mapearFotos(p.photos),
      // cnpj_hash é deliberadamente omitido (documento, RN de privacidade).
    };
  }

  async buscarSwipe(swiperId: string, swipedId: string): Promise<SwipeRegistrado | null> {
    const swipe = await prisma.swipe.findFirst({
      where: { swiper_id: swiperId, swiped_id: swipedId },
    });

    return swipe ? paraSwipeRegistrado(swipe) : null;
  }

  async registrarSwipe(input: RegistrarSwipeRepositoryInput): Promise<SwipeRegistrado> {
    try {
      const swipe = await prisma.swipe.create({
        data: {
          swiper_id: input.swiperId,
          swiped_id: input.swipedId,
          direction: input.direction,
        },
      });

      return paraSwipeRegistrado(swipe);
    } catch (error) {
      // Corrida com outra chamada para o mesmo par: o `@@unique([swiper_id, swiped_id])` do banco
      // rejeitou a segunda escrita (P2002). A operação é idempotente por contrato — devolvemos o
      // registro que já existe em vez de propagar o erro.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existente = await this.buscarSwipe(input.swiperId, input.swipedId);
        if (existente) return existente;
      }
      throw error;
    }
  }
}

function mapearFotos(photos: { url: string; ordem: number | null; is_avatar: boolean }[]): FotoPerfil[] {
  return photos.map((f) => ({ url: f.url, ordem: f.ordem, is_avatar: f.is_avatar }));
}
