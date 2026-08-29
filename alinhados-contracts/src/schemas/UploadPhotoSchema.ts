import { z } from 'zod';
import { registry } from '../registry/openApi';
import {
  errorResponse,
  successEnvelope,
  validationErrorResponse,
} from './appResponse';

// multipart/form-data envia tudo como string — z.coerce.boolean() trataria "false" como true
// (Boolean("false") === true), por isso o parse manual de "true"/"false" abaixo.
const booleanFromFormData = z.preprocess((value) => {
  if (typeof value === 'string') return value === 'true';
  return value;
}, z.boolean());

export const UploadPhotoSchema = registry.register(
  'UploadPhotoSchema',
  z.object({
    isAvatar: booleanFromFormData.default(false).openapi({
      example: false,
      description: 'Indica se a foto enviada é o avatar do perfil (único, substitui o anterior).',
    }),
    ordem: z.coerce.number().int().optional().openapi({
      description: 'Posição da foto na galeria.',
    }),
  })
);

export type UploadPhotoDto = z.infer<typeof UploadPhotoSchema>;

const UploadPhotoResponseSchema = registry.register(
  'UploadPhotoResponseSchema',
  successEnvelope(
    z.object({
      message: z.string(),
      id: z.string().uuid(),
      profileId: z.string().uuid(),
      url: z.string(),
      ordem: z.number().optional(),
      isAvatar: z.boolean(),
      galleryCount: z.number(),
      galleryMinimumReached: z.boolean(),
    })
  )
);

registry.registerPath({
  method: 'post',
  path: '/perfil/fotos/upload',
  description: 'Faz upload de uma foto do perfil autenticado',
  tags: ['Perfil Fotos'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            isAvatar: z.boolean().optional(),
            ordem: z.number().int().optional(),
            file: z.string().openapi({
              type: 'string',
              format: 'binary',
              description: 'Arquivo de imagem da foto',
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Foto enviada com sucesso',
      content: {
        'application/json': {
          schema: UploadPhotoResponseSchema,
        },
      },
    },
    400: validationErrorResponse('Payload ou arquivo inválido'),
    401: errorResponse('Token ausente ou sessão inválida'),
    413: errorResponse('Arquivo maior que o limite de 8MB', {
      code: 'ARQUIVO_MUITO_GRANDE',
      message: 'Arquivo muito grande. Tamanho máximo: 8MB.',
    }),
    415: errorResponse('Formato de arquivo não suportado (só JPEG/PNG/WebP)', {
      code: 'FORMATO_NAO_SUPORTADO',
      message: 'Formato não suportado. Envie JPEG, PNG ou WebP.',
    }),
    404: errorResponse('Perfil autenticado não encontrado', {
      code: 'PERFIL_NAO_ENCONTRADO',
      message: 'Perfil não encontrado.',
    }),
    422: errorResponse('Galeria cheia — máximo de 10 fotos (RF20). Não se aplica ao avatar.', {
      code: 'LIMITE_GALERIA_ATINGIDO',
      message: 'A galeria já tem o máximo de 10 fotos. Remova uma para adicionar outra.',
    }),
  },
});
