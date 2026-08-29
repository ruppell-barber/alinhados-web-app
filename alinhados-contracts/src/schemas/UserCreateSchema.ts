import { z } from 'zod';
import { registry } from '../registry/openApi';

// 1. Definição do Validador e Documentação (Swagger)
export const UserCreateSchema = registry.register(
  'UserCreateRequest',
  z.object({
    name: z.string().min(3).openapi({
      example: 'Melquezedeque',
      description: 'Nome completo do usuário',
    }),
    email: z.string().email().openapi({
      example: 'contato@alinhados.com',
      description: 'E-mail principal para login e contato',
    }),
    password: z.string().min(8).openapi({
      example: 'SenhaForte123!',
      description: 'Senha com no mínimo 8 caracteres',
    }),
  })
);

// 2. Extração do DTO tipado para uso na camada de Aplicação (Use Cases)
export type UserCreateDto = z.infer<typeof UserCreateSchema>;
