import { Module } from '@nestjs/common';
import { MissionResolver } from './mission.resolver';
import { MissionReadService } from './mission-read.service';
import { MissionWriteService } from './mission-write.service';
import { MissionRepository } from './mission.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [MissionResolver, MissionReadService, MissionWriteService, MissionRepository],
  exports: [MissionReadService, MissionWriteService],
})
export class MissionModule {}
