import { Router } from 'express';
import { container } from '../../../../../shared/container';
import { IdentidadeController } from '../controller/IdentidadeController';

const identidadeRouter = Router();
const controller = container.resolve(IdentidadeController);

identidadeRouter.post('/cadastrar', (req, res, next) => controller.cadastrar(req, res, next));
identidadeRouter.post('/login', (req, res, next) => controller.login(req, res, next));
identidadeRouter.post('/logout', (req, res, next) => controller.logout(req, res, next));
identidadeRouter.post('/refresh', (req, res, next) => controller.refresh(req, res, next));
identidadeRouter.post('/recuperar-senha', (req, res, next) => controller.recuperarSenha(req, res, next));
identidadeRouter.post('/redefinir-senha', (req, res, next) => controller.redefinirSenha(req, res, next));
identidadeRouter.post('/alterar-senha', (req, res, next) => controller.alterarSenha(req, res, next));

export { identidadeRouter };
