import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../../../../shared/infra/http/HttpError';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error('Formato não suportado. Envie JPEG, PNG ou WebP.'));
      return;
    }

    callback(null, true);
  },
}).single('file');

/**
 * Envolve o multer para traduzir seus erros em `HttpError` com status limpo. Sem isso, o
 * `MulterError` cru (ex.: arquivo > 8MB) cai no handler genérico e vira 500 em vez de um 413/415.
 */
export function uploadPhotoMiddleware(req: Request, res: Response, next: NextFunction): void {
  upload(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new HttpError(413, 'ARQUIVO_MUITO_GRANDE', 'Arquivo muito grande. Tamanho máximo: 8MB.'));
        return;
      }
      next(new HttpError(400, 'UPLOAD_INVALIDO', `Falha no upload do arquivo: ${err.message}`));
      return;
    }

    // Erro do fileFilter (mime não permitido) ou outra falha ao ler o multipart.
    const message = err instanceof Error ? err.message : 'Formato de arquivo não suportado.';
    next(new HttpError(415, 'FORMATO_NAO_SUPORTADO', message));
  });
}
