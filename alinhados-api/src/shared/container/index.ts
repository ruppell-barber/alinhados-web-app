import { container } from 'tsyringe';

import { IPerfilRepository } from '../../modules/perfil/application/ports/IPerfilRepository';
import { IPhotoRepository } from '../../modules/perfil/application/ports/IPhotoRepository';
import { IFileStorageService } from '../storage/IFileStorageService';
import { IImageProcessorService } from '../../modules/perfil/application/ports/IImageProcessorService';
import { IBarbeariaDetailsRepository } from '../../modules/perfil/application/ports/IBarbeariaDetailsRepository';
import { IBarbeiroDetailsRepository } from '../../modules/perfil/application/ports/IBarbeiroDetailsRepository';
import { IDocumentoProtector } from '../../modules/perfil/application/ports/IDocumentoProtector';
import { PrismaPerfilRepository } from '../../modules/perfil/adapters/infra/postgres-impl/PrismaPerfilRepository';
import { PrismaPhotoRepository } from '../../modules/perfil/adapters/infra/postgres-impl/PrismaPhotoRepository';
import { SupabaseStorageService } from '../../modules/perfil/adapters/infra/storage-impl/SupabaseStorageService';
import { SharpImageProcessorService } from '../../modules/perfil/adapters/infra/storage-impl/SharpImageProcessorService';
import { PrismaBarbeariaDetailsRepository } from '../../modules/perfil/adapters/infra/postgres-impl/PrismaBarbeariaDetailsRepository';
import { PrismaBarbeiroDetailsRepository } from '../../modules/perfil/adapters/infra/postgres-impl/PrismaBarbeiroDetailsRepository';
import { AesDocumentoProtector } from '../../modules/perfil/adapters/infra/crypto-impl/AesDocumentoProtector';
import { IAuthProvider } from '../../modules/identidade/application/ports/IAuthProvider';
import { SupabaseAuthProvider } from '../../modules/identidade/adapters/infra/supabase-impl/SupabaseAuthProvider';
import { IIdentidadeRepository } from '../../modules/identidade/application/ports/IIdentidadeRepository';
import { PrismaIdentidadeRepository } from '../../modules/identidade/adapters/infra/postgres-impl/PrismaIdentidadeRepository';
import { IEnvService, EnvService } from '../infra/services/env';
import { IDiscoveryRepository } from '../../modules/discovery/application/ports/IDiscoveryRepository';
import { PrismaDiscoveryRepository } from '../../modules/discovery/adapters/infra/postgres-impl/PrismaDiscoveryRepository';

container.registerSingleton<IEnvService>('IEnvService', EnvService);

container.registerSingleton<IPerfilRepository>(
  'IPerfilRepository',
  PrismaPerfilRepository
);

container.registerSingleton<IPhotoRepository>(
  'IPhotoRepository',
  PrismaPhotoRepository
);

// Storage de fotos em Supabase Storage (bucket privado + signed URLs). O LocalFileStorageService
// fica no repo como alternativa para dev/testes sem Supabase.
container.registerSingleton<IFileStorageService>(
  'IFileStorageService',
  SupabaseStorageService
);

container.registerSingleton<IBarbeariaDetailsRepository>(
  'IBarbeariaDetailsRepository',
  PrismaBarbeariaDetailsRepository
);

container.registerSingleton<IBarbeiroDetailsRepository>(
  'IBarbeiroDetailsRepository',
  PrismaBarbeiroDetailsRepository
);

container.registerSingleton<IImageProcessorService>(
  'IImageProcessorService',
  SharpImageProcessorService
);

container.registerSingleton<IDocumentoProtector>(
  'IDocumentoProtector',
  AesDocumentoProtector
);

container.registerSingleton<IAuthProvider>(
  'IAuthProvider',
  SupabaseAuthProvider
);

container.registerSingleton<IIdentidadeRepository>(
  'IIdentidadeRepository',
  PrismaIdentidadeRepository
);

container.registerSingleton<IDiscoveryRepository>(
  'IDiscoveryRepository',
  PrismaDiscoveryRepository
);

export { container };
