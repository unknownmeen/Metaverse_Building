import { Module } from '@nestjs/common';
import { JudgingResolver } from './judging.resolver';
import { JudgingService } from './judging.service';
import { JudgingRepository } from './judging.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [JudgingResolver, JudgingService, JudgingRepository],
  exports: [JudgingService],
})
export class JudgingModule {}
