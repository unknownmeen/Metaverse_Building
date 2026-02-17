import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async findById(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return user;
  }

  async findAll() {
    return this.userRepo.findAll();
  }

  async updateProfile(userId: number, input: UpdateUserInput) {
    const data: { name?: string; avatarId?: string; password?: string } = {};
    if (input.name != null) data.name = input.name;
    if (input.avatarId != null) data.avatarId = input.avatarId;
    if (input.password != null) data.password = await bcrypt.hash(input.password, 10);
    return this.userRepo.update(userId, data);
  }
}