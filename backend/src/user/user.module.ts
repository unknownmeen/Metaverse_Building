import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserRepository } from './user.repository';

@Module({
  providers: [UserService, UserResolver, UserRepository],
  exports: [UserService],
})
export class UserModule {}
