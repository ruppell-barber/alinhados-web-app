import { Router } from 'express';
import { container } from '../../../../../shared/container';
import { DiscoveryController } from '../controller/DiscoveryController';
import { criarAutenticacaoMiddleware } from '../../../../identidade/adapters/api-web/middlewares/autenticacao.middleware';
import { AutenticarRequisicaoUseCase } from '../../../../identidade/application/use-cases/AutenticarRequisicaoUseCase';

const discoveryRouter = Router();
const controller = container.resolve(DiscoveryController);
const autenticar = criarAutenticacaoMiddleware(
  container.resolve(AutenticarRequisicaoUseCase)
);

discoveryRouter.get('/barbeiros', autenticar, (req, res, next) =>
  controller.verFeedBarbeiros(req, res, next)
);

discoveryRouter.get('/barbearias', autenticar, (req, res, next) =>
  controller.verFeedBarbearias(req, res, next)
);

discoveryRouter.get('/barbeiros/:id', autenticar, (req, res, next) =>
  controller.verPerfilBarbeiro(req, res, next)
);

discoveryRouter.get('/barbearias/:id', autenticar, (req, res, next) =>
  controller.verPerfilBarbearia(req, res, next)
);

discoveryRouter.post('/swipes', autenticar, (req, res, next) =>
  controller.registrarSwipe(req, res, next)
);

export { discoveryRouter };
