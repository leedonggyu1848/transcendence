import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from 'src/entity/friend.entity';
import { FriendRepository } from 'src/events/repository/friend.repository';
import { FriendService } from './friend.service';

const friendRepo = {
  provide: 'IFriendRepository',
  useClass: FriendRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Friend])],
  providers: [FriendService, friendRepo],
  exports: [friendRepo, FriendService],
})
export class friendModule {}
