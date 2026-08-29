import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { globalErrorHandler } from '../../../../src/shared/infra/http/middlewares/globalErrorHandler';
import { DomainError } from '../../../../src/shared/core/domain/DomainError';
import { ErroDeInfraestrutura } from '../../../../src/shared/core/errors/ErroDeInfraestrutura';
import { HttpError } from '../../../../src/shared/infra/http/HttpError';
import {
  CredenciaisInvalidasError,
  ContaSuspensaError,
  ContaJaExisteError,
  ContaSemPerfilError,
} from '../../../../src/modules/identidade/domain/errors/IdentidadeErrors';
import {
  FotoNaoPertenceAoPerfilError,
  PerfilNaoEncontradoError as PerfilNaoEncontradoNoModuloPerfilError,
} from '../../../../src/modules/perfil/domain/errors/PerfilErrors';

// Fake Response mínimo que captura status e payload
function makeRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    req: { originalUrl: '/identidade/login' },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

function run(err: Error) {
  const res = makeRes();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalErrorHandler(err, {} as any, res as any, vi.fn());
  return res;
}

describe('globalErrorHandler', () => {
  it('mapeia ZodError -> 400', () => {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse({ email: 'nao-email' });
    const res = run((parsed as { error: z.ZodError }).error);
    expect(res.statusCode).toBe(400);
  });

  it('reconhece ZodError estrutural vindo de outra instância do pacote', () => {
    const externalZodError = new Error('payload inválido') as Error & {
      issues: z.ZodIssue[];
    };
    externalZodError.name = 'ZodError';
    externalZodError.issues = [
      {
        code: 'custom',
        path: ['nome'],
        message: 'Nome inválido',
      },
    ];

    expect(run(externalZodError).statusCode).toBe(400);
  });

  it('mapeia HttpError para o status declarado', () => {
    const res = run(new HttpError(401, 'AUTHORIZATION_HEADER_MISSING', 'Token de acesso não fornecido.'));
    expect(res.statusCode).toBe(401);
  });

  it('mapeia ErroDeInfraestrutura -> 503', () => {
    const res = run(new ErroDeInfraestrutura('Provedor indisponível.'));
    expect(res.statusCode).toBe(503);
  });

  const codeOf = (res: ReturnType<typeof run>) => (res.body as { error: { code: string } }).error.code;

  it('mapeia kind "auth" -> 401 e preserva o code específico', () => {
    const res = run(new CredenciaisInvalidasError());
    expect(res.statusCode).toBe(401);
    expect(codeOf(res)).toBe('CREDENCIAIS_INVALIDAS');
  });

  it('mapeia kind "permission" -> 403 e preserva o code específico', () => {
    const res = run(new ContaSuspensaError());
    expect(res.statusCode).toBe(403);
    expect(codeOf(res)).toBe('CONTA_SUSPENSA');
  });

  it('mapeia kind "conflict" -> 409 e preserva o code específico', () => {
    const jaExiste = run(new ContaJaExisteError());
    expect(jaExiste.statusCode).toBe(409);
    expect(codeOf(jaExiste)).toBe('CONTA_JA_EXISTE');

    const semPerfil = run(new ContaSemPerfilError());
    expect(semPerfil.statusCode).toBe(409);
    expect(codeOf(semPerfil)).toBe('CONTA_SEM_PERFIL');
  });

  it('mapeia kind "business" (DomainError padrão) -> 422', () => {
    expect(run(new DomainError('Regra violada.')).statusCode).toBe(422);
  });

  it('mapeia erros semânticos de Perfil para 404 e 403', () => {
    const notFound = run(new PerfilNaoEncontradoNoModuloPerfilError());
    expect(notFound.statusCode).toBe(404);
    expect(codeOf(notFound)).toBe('PERFIL_NAO_ENCONTRADO');

    const forbidden = run(new FotoNaoPertenceAoPerfilError());
    expect(forbidden.statusCode).toBe(403);
    expect(codeOf(forbidden)).toBe('FOTO_NAO_PERTENCE_AO_PERFIL');
  });

  it('mapeia erro desconhecido -> 500', () => {
    expect(run(new Error('boom')).statusCode).toBe(500);
  });
});
