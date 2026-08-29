import { z } from 'zod';

/**
 * Paginação compartilhada dos feeds do Discovery (E04 barbeiros e B04 barbearias).
 *
 * Fica aqui, e não em `FeedBarbeiroSchema`, porque os dois lados reusam a mesma query — um lado não
 * deve importar paginação de um arquivo com nome do outro. O teto de `pageSize` é 50 (mais baixo que
 * a `PaginationSchema` genérica) por causa do RNF01 (feed < 0,75s): página grande demais pesa no motor.
 */
export const FeedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export type FeedQueryDto = z.infer<typeof FeedQuerySchema>;
