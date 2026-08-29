import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { uploadPhotoMiddleware } from '../../../../../../src/modules/perfil/adapters/api-web/middlewares/uploadPhoto.middleware';

function buildFormData(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

describe('uploadPhotoMiddleware', () => {
  let server: ReturnType<typeof createServer>;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();

    app.post('/upload', uploadPhotoMiddleware, (req, res) => {
      if (req.file) {
        return res.status(200).json({ ok: true, mimetype: req.file.mimetype, size: req.file.size });
      }

      return res.status(400).json({ ok: false, message: 'arquivo ausente' });
    });

    // O próprio uploadPhotoMiddleware traduz erros do multer em HttpError (com .status). Aqui só
    // refletimos esse status — como faz o globalErrorHandler no app real.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err?.status ?? 500).json({ ok: false, message: err?.message || 'erro de upload' });
    });

    server = createServer(app);

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  it('aceita image/jpeg', async () => {
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: buildFormData(new File([Buffer.from('abc')], 'foto.jpg', { type: 'image/jpeg' })),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.mimetype).toBe('image/jpeg');
  });

  it('aceita image/png', async () => {
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: buildFormData(new File([Buffer.from('abc')], 'foto.png', { type: 'image/png' })),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.mimetype).toBe('image/png');
  });

  it('rejeita video/mp4 com 415 (formato não suportado)', async () => {
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: buildFormData(new File([Buffer.from('abc')], 'video.mp4', { type: 'video/mp4' })),
    });

    expect(response.status).toBe(415);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it('rejeita arquivo acima de 8 MB', async () => {
    const file = new File([new Uint8Array(9 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: buildFormData(file),
    });

    expect(response.status).toBe(413);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });
});
