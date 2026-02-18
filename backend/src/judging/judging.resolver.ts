import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JudgingStepEntity } from './entities/judging-step.entity';
import { JudgingService } from './judging.service';
import { CreateJudgingStepInput } from './dto/create-judging-step.input';
import { UpdateJudgingStepInput } from './dto/update-judging-step.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StepStatus, UserRole } from '@prisma/client';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => JudgingStepEntity)
export class JudgingResolver {
  constructor(private judgingService: JudgingService) {}

  @Query(() => JudgingStepEntity, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async judgingStep(@Args('id') id: string) {
    return this.judgingService.findById(id);
  }

  @Mutation(() => JudgingStepEntity)
  @UseGuards(JwtAuthGuard)
  async createJudgingStep(
    @Args('input') input: CreateJudgingStepInput,
    @CurrentUser('id') userId: number,
  ) {
    return this.judgingService.create(input, userId);
  }

  @Mutation(() => JudgingStepEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateJudgingStep(
    @Args('id') id: string,
    @Args('input') input: UpdateJudgingStepInput,
  ) {
    return this.judgingService.update(id, input);
  }

  @Mutation(() => JudgingStepEntity)
  @UseGuards(JwtAuthGuard)
  async updateStepStatus(
    @Args('id') id: string,
    @Args('status', { type: () => StepStatus }) status: StepStatus,
    @CurrentUser('id') userId: number,
  ) {
    return this.judgingService.updateStepStatus(id, status, userId);
  }
}
