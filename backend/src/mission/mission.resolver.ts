import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MissionEntity } from './entities/mission.entity';
import { MissionReadService } from './mission-read.service';
import { MissionWriteService } from './mission-write.service';
import { CreateMissionInput } from './dto/create-mission.input';
import { UpdateMissionInput } from './dto/update-mission.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MissionStatus, UserRole } from '@prisma/client';

@Resolver(() => MissionEntity)
export class MissionResolver {
  constructor(
    private missionRead: MissionReadService,
    private missionWrite: MissionWriteService,
  ) {}

  @Query(() => MissionEntity, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async mission(@Args('id') id: string) {
    return this.missionRead.getMission(id);
  }

  @Query(() => [MissionEntity])
  @UseGuards(JwtAuthGuard)
  async missionsByProduct(@Args('productId') productId: string) {
    return this.missionRead.getMissionsByProduct(productId);
  }

  @Mutation(() => MissionEntity)
  @UseGuards(JwtAuthGuard)
  async createMission(
    @Args('input') input: CreateMissionInput,
    @CurrentUser('id') userId: number,
  ) {
    return this.missionWrite.create(input, userId);
  }

  @Mutation(() => MissionEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateMission(
    @Args('id') id: string,
    @Args('input') input: UpdateMissionInput,
  ) {
    return this.missionWrite.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteMission(@Args('id') id: string) {
    return this.missionWrite.delete(id);
  }

  @Mutation(() => MissionEntity)
  @UseGuards(JwtAuthGuard)
  async updateMissionStatus(
    @Args('id') id: string,
    @Args('status', { type: () => MissionStatus }) status: MissionStatus,
    @CurrentUser('id') userId: number,
  ) {
    return this.missionWrite.updateStatus(id, status, userId);
  }

  @Mutation(() => MissionEntity)
  @UseGuards(JwtAuthGuard)
  async takeMission(
    @Args('id') id: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.missionWrite.takeMission(id, userId);
  }
}