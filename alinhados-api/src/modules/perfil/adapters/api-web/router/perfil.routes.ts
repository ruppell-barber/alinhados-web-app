import { Router } from 'express';
import { container } from 'tsyringe';
import { UpdatePerfilController } from '../controller/UpdatePerfilController';
import { GetPerfilController } from '../controller/GetPerfilController';
import { BarbeariaDetailsController } from '../controller/BarbeariaDetailsController';
import { BarbeiroDetailsController } from '../controller/BarbeiroDetailsController';
import { UpdateHiringStatusController } from '../controller/UpdateHiringStatusController';
import { perfilFotosRoutes } from './perfil-fotos.routes';
import { autenticacaoMiddleware } from '../../../../identidade/adapters/api-web/middlewares/autenticacao.middleware';

const perfilRoutes = Router();
const updatePerfilController = container.resolve(UpdatePerfilController);
const getPerfilController = container.resolve(GetPerfilController);
const detailsController = container.resolve(BarbeariaDetailsController);
const barbeiroDetailsController = container.resolve(BarbeiroDetailsController);
const updateHiringStatusController = container.resolve(UpdateHiringStatusController);

perfilRoutes.patch(
  '/me',
  autenticacaoMiddleware,
  (req, res) => updatePerfilController.update(req, res)
);
perfilRoutes.post(
  '/me/barbearia-details',
  autenticacaoMiddleware,
  (req, res) => detailsController.create(req, res)
);
perfilRoutes.post(
  '/me/barbeiro-details',
  autenticacaoMiddleware,
  (req, res) => barbeiroDetailsController.create(req, res)
);
perfilRoutes.patch(
  '/me/hiring-status',
  autenticacaoMiddleware,
  (req, res) => updateHiringStatusController.update(req, res)
);

// IMPORTANTE: o mount de '/fotos' precisa vir antes de 'GET /:id',
// senão 'GET /perfil/fotos' seria capturado por :id = "fotos".
perfilRoutes.use('/fotos', perfilFotosRoutes);

perfilRoutes.get('/:id', (req, res) => getPerfilController.show(req, res));

export { perfilRoutes };
