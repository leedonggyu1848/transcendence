import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from 'src/entity/friend.entity';
import { User } from 'src/entity/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { FriendService } from './friend.service';
import { FriendRepository } from './repository/friend.repository';

const friendRepo = {
  provide: 'IFriendRepository',
  useClass: FriendRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Friend])],
  providers: [FriendService, friendRepo],
  exports: [FriendService, friendRepo],
})
export class FriendModule {}
