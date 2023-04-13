import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from 'src/entity/friend.entity';
import { Users } from 'src/entity/user.entity';
import { UserRepository } from 'src/user/repository/users.repository';
import { UserService } from 'src/user/user.service';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendRepository } from './repository/friend.repository';

const userRepo = {
  provide: 'IUserRepository',
  useClass: UserRepository,
};

const friendRepo = {
  provide: 'IFriendRepository',
  useClass: FriendRepository,
};

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Users, Friend])],
  controllers: [FriendController],
  providers: [UserService, FriendService, userRepo, friendRepo],
})
export class FriendModule {}
