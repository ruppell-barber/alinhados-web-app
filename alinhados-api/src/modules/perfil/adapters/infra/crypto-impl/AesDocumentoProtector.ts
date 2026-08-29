import { injectable } from 'tsyringe';
import { encryptDocumento } from '../../../../../shared/infra/crypto/documentoCrypto';
import { IDocumentoProtector } from '../../../application/ports/IDocumentoProtector';

@injectable()
export class AesDocumentoProtector implements IDocumentoProtector {
  protect(value: string): string {
    return encryptDocumento(value);
  }
}
