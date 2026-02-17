import { Module } from '@nestjs/common';
import { ProductResolver } from './product.resolver';
import { ProductReadService } from './product-read.service';
import { ProductWriteService } from './product-write.service';
import { ProductRepository } from './product.repository';
import { MissionModule } from '../mission/mission.module';

@Module({
  imports: [MissionModule],
  providers: [ProductResolver, ProductReadService, ProductWriteService, ProductRepository],
  exports: [ProductReadService, ProductWriteService],
})
export class ProductModule {}
