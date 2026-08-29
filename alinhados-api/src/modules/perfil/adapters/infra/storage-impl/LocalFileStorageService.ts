import { promises as fs } from 'node:fs';
import path from 'node:path';
import { injectable } from 'tsyringe';
import {
  FileStorageInput,
  FileStorageOutput,
  IFileStorageService,
} from '../../../../../shared/storage/IFileStorageService';

/**
 * Armazenamento local em disco (`uploads/`). Mantido para dev/testes sem Supabase.
 * Não há signed URL de verdade no disco — `getSignedUrl` só devolve o path como URL relativa.
 */
@injectable()
export class LocalFileStorageService implements IFileStorageService {
  async upload(input: FileStorageInput): Promise<FileStorageOutput> {
    const uploadsRoot = path.resolve(process.cwd(), 'uploads');
    const targetFolder = path.join(uploadsRoot, input.folder);

    await fs.mkdir(targetFolder, { recursive: true });

    const fullFilePath = path.join(targetFolder, input.fileName);
    await fs.writeFile(fullFilePath, input.buffer);

    const storagePath = `${input.folder}/${input.fileName}`.replace(/\\/g, '/');

    return { storagePath };
  }

  async getSignedUrl(storagePath: string): Promise<string> {
    return `/uploads/${storagePath}`;
  }

  async getSignedUrls(storagePaths: string[]): Promise<Array<string | null>> {
    return Promise.all(storagePaths.map((p) => this.getSignedUrl(p)));
  }

  async delete(storagePath: string): Promise<void> {
    const fullFilePath = path.resolve(process.cwd(), 'uploads', storagePath);
    await fs.rm(fullFilePath, { force: true });
  }
}
