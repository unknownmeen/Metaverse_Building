export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface UploadResult {
  url: string;
  fileName: string;
}

export interface FileLike {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface IStorageProvider {
  upload(file: FileLike): Promise<UploadResult>;
  delete(fileName: string): Promise<void>;
  getUrl(fileName: string): string;
}
