/**
 * Porta secundária do Discovery. Lê diretamente as tabelas necessárias para montar o feed
 * (`profiles`, `barbeiro_details`, `swipes`) — é um contexto de leitura/consulta (read model),
 * por isso não depende dos módulos Identidade nem Perfil.
 */

export interface ViewerInfo {
  id: string;
  user_type: 'barbeiro' | 'barbearia';
  cidade: string | null;
  estado: string | null;
}

/** Card de barbeiro (RF58) — projeção de leitura, não é entidade de domínio. */
export interface CardBarbeiro {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  cidade: string | null;
  estado: string | null;
  servicos: string[];
  valores: string[];
  taxa_ocupacao: number | null;
  comissao_desejada: number | null;
  /**
   * Vínculo atual do barbeiro (RF25) — informativo. No feed o status é sempre `disponivel`, então
   * este é o sinal de "empregado, mas aberto a propostas" (B09). NÃO é critério de exclusão do feed.
   */
  esta_desempregado: boolean;
}

/** Card de barbearia (RF59) — projeção de leitura, não é entidade de domínio. */
export interface CardBarbearia {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  cidade: string | null;
  estado: string | null;
  num_cadeiras: number | null;
  comissao_paga: number | null;
  tem_fixo: boolean;
  valor_fixo: number | null;
  valores: string[];
}

/** Foto do portfólio/galeria (tabela `photos`). */
export interface FotoPerfil {
  url: string;
  ordem: number | null;
  is_avatar: boolean;
}

/**
 * Perfil completo do barbeiro (E12/RF62) — visão read-only para a barbearia decidir antes do like.
 * Expõe faturamento e taxa de ocupação (públicos por RN08). NÃO expõe `cpf_hash` (documento).
 */
export interface PerfilBarbeiro {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  cidade: string | null;
  estado: string | null;
  apelido_profissional: string | null;
  anos_experiencia: number | null;
  servicos: string[];
  cursos_formacao: string | null;
  comissao_desejada: number | null;
  faturamento_mensal: number | null;
  taxa_ocupacao: number | null;
  recorde_meta: string | null;
  valores: string[];
  barbearia_atual: string | null;
  esta_desempregado: boolean;
  fotos: FotoPerfil[];
}

/**
 * Perfil completo da barbearia (B12/RF62) — visão read-only para o barbeiro decidir antes do like.
 * NÃO expõe `cnpj_hash` (documento).
 */
export interface PerfilBarbearia {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  cidade: string | null;
  estado: string | null;
  nome_decisor: string | null;
  num_cadeiras: number | null;
  vagas_abertas: number | null;
  comissao_paga: number | null;
  tem_fixo: boolean;
  valor_fixo: number | null;
  tem_clube: boolean;
  descricao_clube: string | null;
  tem_pops: boolean;
  num_unidades: number | null;
  e_franquia: boolean;
  faturamento_medio: number | null;
  valores: string[];
  esta_contratando: boolean;
  fotos: FotoPerfil[];
}

export interface FeedPaginacao {
  page: number;
  pageSize: number;
}

/** Um swipe (like/dislike) já registrado (RF57). */
export interface SwipeRegistrado {
  id: string;
  swiperId: string;
  swipedId: string;
  direction: 'like' | 'dislike';
  createdAt: Date;
}

export interface RegistrarSwipeRepositoryInput {
  swiperId: string;
  swipedId: string;
  direction: 'like' | 'dislike';
}

export interface IDiscoveryRepository {
  /** Localização + tipo do viewer, para derivar o lado oposto e o filtro geográfico. */
  obterViewer(viewerId: string): Promise<ViewerInfo | null>;

  /**
   * Barbeiros compatíveis para uma barbearia: mesmo estado (cidade prioritária), completos,
   * disponíveis e ainda não avaliados pelo viewer, paginados.
   */
  buscarFeedBarbeiros(viewer: ViewerInfo, paginacao: FeedPaginacao): Promise<CardBarbeiro[]>;

  /**
   * Barbearias compatíveis para um barbeiro: mesmo estado (cidade prioritária), completas,
   * contratando (`aberto`) e ainda não avaliadas pelo viewer, paginadas.
   */
  buscarFeedBarbearias(viewer: ViewerInfo, paginacao: FeedPaginacao): Promise<CardBarbearia[]>;

  /** Perfil completo de um barbeiro por id (E12). `null` se não existe ou não é barbeiro. */
  obterPerfilBarbeiro(barbeiroId: string): Promise<PerfilBarbeiro | null>;

  /** Perfil completo de uma barbearia por id (B12). `null` se não existe ou não é barbearia. */
  obterPerfilBarbearia(barbeariaId: string): Promise<PerfilBarbearia | null>;

  /** Swipe já registrado para o par (swiperId, swipedId), se existir (idempotência — RN14). */
  buscarSwipe(swiperId: string, swipedId: string): Promise<SwipeRegistrado | null>;

  /**
   * Registra um novo swipe (RF57). Em caso de corrida com outra chamada para o mesmo par
   * (violação do `@@unique([swiper_id, swiped_id])`), deve devolver o registro já existente
   * em vez de propagar o erro — a operação é idempotente por contrato.
   */
  registrarSwipe(input: RegistrarSwipeRepositoryInput): Promise<SwipeRegistrado>;
}
