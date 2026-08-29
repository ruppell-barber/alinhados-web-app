import { Router } from 'express';
import { container } from 'tsyringe';
import { UploadPhotoController } from '../controller/UploadPhotoController';
import { ListPhotosController } from '../controller/ListPhotosController';
import { DeletePhotoController } from '../controller/DeletePhotoController';
import { uploadPhotoMiddleware } from '../middlewares/uploadPhoto.middleware';
import { autenticacaoMiddleware } from '../../../../identidade/adapters/api-web/middlewares/autenticacao.middleware';

const perfilFotosRoutes = Router();

const uploadController = container.resolve(UploadPhotoController);
const listController = container.resolve(ListPhotosController);
const deleteController = container.resolve(DeletePhotoController);

perfilFotosRoutes.get('/', (req, res) => listController.handle(req, res));

perfilFotosRoutes.post(
  '/upload',
  autenticacaoMiddleware,
  uploadPhotoMiddleware,
  (req, res) => uploadController.create(req, res)
);

perfilFotosRoutes.delete(
  '/:photoId',
  autenticacaoMiddleware,
  (req, res) => deleteController.handle(req, res)
);

export { perfilFotosRoutes };
