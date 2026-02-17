import { Module } from '@nestjs/common';
import { UploadResolver } from './upload.resolver';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { STORAGE_PROVIDER } from '../common/interfaces/storage-provider.interface';

@Module({
  controllers: [UploadController],
  providers: [
    UploadResolver,
    UploadService,
    {
      provide: STORAGE_PROVIDER,
      useClass: LocalStorageStrategy,
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}