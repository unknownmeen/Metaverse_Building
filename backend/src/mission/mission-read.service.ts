import { Injectable, NotFoundException } from '@nestjs/common';
import { MissionRepository } from './mission.repository';

@Injectable()
export class MissionReadService {
  constructor(private missionRepo: MissionRepository) {}

  async getMission(id: string) {
    const mission = await this.missionRepo.findById(id);
    if (!mission) throw new NotFoundException('ماموریت یافت نشد');
    return mission;
  }

  async getMissionsByProduct(productId: string) {
    return this.missionRepo.findByProductId(productId);
  }
}