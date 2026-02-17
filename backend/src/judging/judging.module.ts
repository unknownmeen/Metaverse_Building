import { Module } from '@nestjs/common';
import { JudgingResolver } from './judging.resolver';
import { JudgingService } from './judging.service';
import { JudgingRepository } from './judging.repository';

@Module({
  providers: [JudgingResolver, JudgingService, JudgingRepository],
  exports: [JudgingService],
})
export class JudgingModule {}
