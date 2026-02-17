import { Injectable, Inject } from '@nestjs/common';
import type { IStorageProvider } from '../common/interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from '../common/interfaces/storage-provider.interface';
import type { FileLike } from '../common/interfaces/storage-provider.interface';

@Injectable()
export class UploadService {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider) {}

  async uploadFile(file: FileLike) {
    return this.storage.upload(file);
  }

  getFileUrl(fileName: string): string {
    return this.storage.getUrl(fileName);
  }
}