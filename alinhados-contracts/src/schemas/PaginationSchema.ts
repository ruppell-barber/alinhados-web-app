import { z } from 'zod';
import { registry } from '../registry/openApi';

export const PaginationSchema = registry.register(
  'PaginationRequest',
  z.object({
    page: z.coerce.number().int().min(1).default(1).openapi({ example: 1, description: 'Número da página' }),
    limit: z.coerce.number().int().min(1).max(100).default(10).openapi({ example: 10, description: 'Itens por página' }),
  })
);

export type PaginationDto = z.infer<typeof PaginationSchema>;
