import { inject, injectable } from 'tsyringe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  FileStorageInput,
  FileStorageOutput,
  IFileStorageService,
} from '../../../../../shared/storage/IFileStorageService';
import { ErroDeInfraestrutura } from '../../../../../shared/core/errors/ErroDeInfraestrutura';
import { IEnvService } from '../../../../../shared/infra/services/env';

const BUCKET = 'perfil-fotos';
const SIGNED_URL_TTL_SECONDS = 3600; // 1h

/**
 * Armazenamento no Supabase Storage em bucket **privado**. Persiste-se o path; o acesso é via
 * signed URL temporária gerada na leitura (nunca uma URL pública permanente).
 */
@injectable()
export class SupabaseStorageService implements IFileStorageService {
  private readonly client: SupabaseClient;
  private bucketReady?: Promise<void>;

  constructor(@inject('IEnvService') envService: IEnvService) {
    this.client = createClient(
      envService.get('SUPABASE_URL'),
      envService.get('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }

  /** Garante o bucket privado (idempotente, uma vez por processo) — evita passo manual por ambiente. */
  private ensureBucket(): Promise<void> {
    if (!this.bucketReady) {
      this.bucketReady = (async () => {
        const { data } = await this.client.storage.getBucket(BUCKET);
        if (!data) {
          const { error } = await this.client.storage.createBucket(BUCKET, { public: false });
          // Corrida entre instâncias pode criar em paralelo; "já existe" não é falha real.
          if (error && !/already exists/i.test(error.message)) {
            throw this.indisponivel('Falha ao criar o bucket de fotos.', error);
          }
        }
      })().catch((err) => {
        // não memoiza falha: permite retentar na próxima chamada
        this.bucketReady = undefined;
        throw err;
      });
    }
    return this.bucketReady;
  }

  async upload(input: FileStorageInput): Promise<FileStorageOutput> {
    await this.ensureBucket();
    const storagePath = `${input.folder}/${input.fileName}`;

    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(storagePath, input.buffer, { contentType: input.mimeType, upsert: true });

    if (error) {
      throw this.indisponivel('Falha ao enviar a foto para o storage.', error);
    }

    return { storagePath };
  }

  async getSignedUrl(storagePath: string): Promise<string> {
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

    if (error || !data) {
      throw this.indisponivel('Falha ao gerar a URL assinada da foto.', error);
    }

    return data.signedUrl;
  }

  async getSignedUrls(storagePaths: string[]): Promise<Array<string | null>> {
    if (storagePaths.length === 0) return [];

    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrls(storagePaths, SIGNED_URL_TTL_SECONDS);

    if (error || !data) {
      throw this.indisponivel('Falha ao gerar as URLs assinadas das fotos.', error);
    }

    // Preserva a ordem; item com erro (ex.: path inexistente) vira null em vez de quebrar tudo.
    return data.map((item) => item.signedUrl ?? null);
  }

  async delete(storagePath: string): Promise<void> {
    const { error } = await this.client.storage.from(BUCKET).remove([storagePath]);
    if (error) {
      throw this.indisponivel('Falha ao remover a foto do storage.', error);
    }
  }

  private indisponivel(message: string, cause?: unknown): ErroDeInfraestrutura {
    return new ErroDeInfraestrutura(message, { cause });
  }
}
