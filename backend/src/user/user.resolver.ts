import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { UpdateUserInput } from './dto/update-user.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => UserEntity, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('id') userId: number) {
    return this.userService.findById(userId);
  }

  @Query(() => [UserEntity])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async users() {
    return this.userService.findAll();
  }

  @Mutation(() => UserEntity)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser('id') userId: number,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.userService.updateProfile(userId, input);
  }
}