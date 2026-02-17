import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => NotificationEntity)
export class NotificationResolver {
  constructor(private notificationService: NotificationService) {}

  @Query(() => [NotificationEntity])
  @UseGuards(JwtAuthGuard)
  async notifications(@CurrentUser('id') userId: number) {
    return this.notificationService.getNotifications(userId);
  }

  @Query(() => Number)
  @UseGuards(JwtAuthGuard)
  async unreadNotificationCount(@CurrentUser('id') userId: number) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async markNotificationRead(
    @Args('id') id: string,
    @CurrentUser('id') userId: number,
  ) {
    await this.notificationService.markRead(id, userId);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsRead(@CurrentUser('id') userId: number) {
    await this.notificationService.markAllRead(userId);
    return true;
  }
}