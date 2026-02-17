import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JudgingStepEntity } from './entities/judging-step.entity';
import { JudgingService } from './judging.service';
import { CreateJudgingStepInput } from './dto/create-judging-step.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StepStatus } from '@prisma/client';

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
  @UseGuards(JwtAuthGuard)
  async updateStepStatus(
    @Args('id') id: string,
    @Args('status', { type: () => StepStatus }) status: StepStatus,
    @CurrentUser('id') userId: number,
  ) {
    return this.judgingService.updateStepStatus(id, status, userId);
  }
}