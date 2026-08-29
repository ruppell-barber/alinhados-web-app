import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { FeedQuerySchema, PerfilIdParamSchema, RegistrarSwipeSchema } from '@alinhados/contracts';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import { HttpError } from '../../../../../shared/infra/http/HttpError';
import {
  VerFeedBarbeirosUseCase,
  VerFeedBarbeirosInput,
} from '../../../application/use-cases/VerFeedBarbeirosUseCase';
import {
  VerFeedBarbeariasUseCase,
  VerFeedBarbeariasInput,
} from '../../../application/use-cases/VerFeedBarbeariasUseCase';
import {
  VerPerfilBarbeiroUseCase,
  VerPerfilBarbeiroInput,
} from '../../../application/use-cases/VerPerfilBarbeiroUseCase';
import {
  VerPerfilBarbeariaUseCase,
  VerPerfilBarbeariaInput,
} from '../../../application/use-cases/VerPerfilBarbeariaUseCase';
import {
  RegistrarSwipeUseCase,
  RegistrarSwipeInput,
} from '../../../application/use-cases/RegistrarSwipeUseCase';

@injectable()
export class DiscoveryController {
  constructor(
    @inject(VerFeedBarbeirosUseCase) private readonly verFeedBarbeirosUseCase: VerFeedBarbeirosUseCase,
    @inject(VerFeedBarbeariasUseCase) private readonly verFeedBarbeariasUseCase: VerFeedBarbeariasUseCase,
    @inject(VerPerfilBarbeiroUseCase) private readonly verPerfilBarbeiroUseCase: VerPerfilBarbeiroUseCase,
    @inject(VerPerfilBarbeariaUseCase) private readonly verPerfilBarbeariaUseCase: VerPerfilBarbeariaUseCase,
    @inject(RegistrarSwipeUseCase) private readonly registrarSwipeUseCase: RegistrarSwipeUseCase
  ) {}

  /** GET /discovery/barbeiros — feed de barbeiros compatíveis, para a barbearia autenticada (E04). */
  async verFeedBarbeiros(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // O middleware de autenticação já garante o userId; a checagem narra o tipo para o TS.
      if (!req.userId) {
        throw new HttpError(401, 'AUTHORIZATION_HEADER_MISSING', 'Token de acesso não fornecido.');
      }
      const { page, pageSize } = FeedQuerySchema.parse(req.query);
      const input: VerFeedBarbeirosInput = { viewerId: req.userId, page, pageSize };
      const result = await this.verFeedBarbeirosUseCase.execute(input);
      return AppResponse.ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  /** GET /discovery/barbearias — feed de barbearias compatíveis, para o barbeiro autenticado (B04). */
  async verFeedBarbearias(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.userId) {
        throw new HttpError(401, 'AUTHORIZATION_HEADER_MISSING', 'Token de acesso não fornecido.');
      }
      const { page, pageSize } = FeedQuerySchema.parse(req.query);
      const input: VerFeedBarbeariasInput = { viewerId: req.userId, page, pageSize };
      const result = await this.verFeedBarbeariasUseCase.execute(input);
      return AppResponse.ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  /** GET /discovery/barbeiros/:id — perfil completo do barbeiro, para a barbearia autenticada (E12). */
  async verPerfilBarbeiro(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.userId) {
        throw new HttpError(401, 'AUTHORIZATION_HEADER_MISSING', 'Token de acesso não fornecido.');
      }
      const { id } = PerfilIdParamSchema.parse(req.params);
      const input: VerPerfilBarbeiroInput = { viewerId: req.userId, barbeiroId: id };
      const result = await this.verPerfilBarbeiroUseCase.execute(input);
      return AppResponse.ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  /** GET /discovery/barbearias/:id — perfil completo da barbearia, para o barbeiro autenticado (B12). */
  async verPerfilBarbearia(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.userId) {
        throw new HttpError(401, 'AUTHORIZATION_HEADER_MISSING', 'Token de acesso não fornecido.');
      }
      const { id } = PerfilIdParamSchema.parse(req.params);
      const input: VerPerfilBarbeariaInput = { viewerId: req.userId, barbeariaId: id };
      const result = await this.verPerfilBarbeariaUseCase.execute(input);
      return AppResponse.ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  /** POST /discovery/swipes — registra like/dislike do perfil autenticado sobre outro perfil (RF57). */
  async registrarSwipe(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.userId) {
        throw new HttpError(401, 'AUTHORIZATION_HEADER_MISSING', 'Token de acesso não fornecido.');
      }
      const { swipedId, direction } = RegistrarSwipeSchema.parse(req.body);
      const input: RegistrarSwipeInput = { swiperId: req.userId, swipedId, direction };
      const result = await this.registrarSwipeUseCase.execute(input);
      return AppResponse.created(res, result);
    } catch (err) {
      next(err);
    }
  }
}
