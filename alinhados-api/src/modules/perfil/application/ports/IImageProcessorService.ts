export interface ProcessImageInput {
  buffer: Buffer;
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export interface ProcessImageOutput {
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

export interface IImageProcessorService {
  process(input: ProcessImageInput): Promise<ProcessImageOutput>;
}