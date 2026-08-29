export interface FileStorageInput {
  folder: string;
  fileName: string;
  buffer: Buffer;
  mimeType: string;
}

export interface FileStorageOutput {
  /** Caminho do objeto no storage (privado). NÃO é uma URL — é o que se persiste. */
  storagePath: string;
}

/**
 * Porta de armazenamento de arquivos (compartilhada entre Perfil e Discovery).
 *
 * O bucket é **privado**: o que se persiste é o `storagePath`; a URL de acesso é uma **signed URL
 * temporária** gerada na hora de responder ao cliente (`getSignedUrl(s)`), respeitando a autorização
 * de quem pediu (RN02) — quem não é autorizado a ver o perfil simplesmente não recebe URL.
 */
export interface IFileStorageService {
  upload(input: FileStorageInput): Promise<FileStorageOutput>;

  /** URL assinada temporária para um path privado. Lança em caso de falha. */
  getSignedUrl(storagePath: string): Promise<string>;

  /**
   * Assina vários paths de uma vez (batch — usado nos feeds). Retorna `null` na posição de cada
   * path que falhar (ex.: objeto inexistente), sem derrubar a resposta inteira.
   */
  getSignedUrls(storagePaths: string[]): Promise<Array<string | null>>;

  /** Remove o objeto do storage. */
  delete(storagePath: string): Promise<void>;
}
