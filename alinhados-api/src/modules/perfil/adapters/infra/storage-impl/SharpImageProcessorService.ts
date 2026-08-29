import { injectable } from 'tsyringe';
import sharp from 'sharp';
import {
  IImageProcessorService,
  ProcessImageInput,
  ProcessImageOutput,
} from '../../../application/ports/IImageProcessorService';

@injectable()
export class SharpImageProcessorService implements IImageProcessorService {
  async process(input: ProcessImageInput): Promise<ProcessImageOutput> {
    const { data, info } = await sharp(input.buffer)
      .resize({
        width: input.maxWidth,
        height: input.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: input.quality })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      mimeType: 'image/jpeg',
      sizeBytes: info.size,
      width: info.width,
      height: info.height,
    };
  }
}