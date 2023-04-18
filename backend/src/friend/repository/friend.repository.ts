import { InjectRepository } from '@nestjs/typeorm';
import { FriendDto } from 'src/dto/friend.dto';
import { FriendReqType } from 'src/entity/common.enum';
import { Friend } from 'src/entity/friend.entity';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IFriendRepository } from './friend.interface.repository';

export class FriendRepository implements IFriendRepository {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
  ) {}

  userToFriendDto(user: Users, time: Date, type: FriendReqType) {
    const friendDto: FriendDto = {
      intra_id: user.intra_id,
      profile: user.profile,
      time: time,
      type: type,
    };
    return friendDto;
  }

  async addFriend(user: Users, friendname: string) {
    await this.friendRepository.save({
      user: user,
      friendname: friendname,
      accept: false,
      time: new Date(Date.now()),
    });
  }

  // testcode -> TODO: delete
  async addDummyFriend(user: Users, friendname: string) {
    await this.friendRepository.save({
      user: user,
      friendname: friendname,
      accept: true,
      time: new Date(Date.now()),
    });
  }

  async findAll(user: Users) {
    return await this.friendRepository.find({
      where: { user: { id: user.id } },
    });
  }

  async findAllWithJoin(user: Users) {
    return await this.friendRepository.find({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
  }

  async findFriends(user: Users) {
    return await this.friendRepository.find({
      where: { user: { id: user.id }, accept: true },
    });
  }

  async findFriendsWithJoin(user: Users) {
    return await this.friendRepository.find({
      where: { user: { id: user.id }, accept: true },
      relations: ['user'],
    });
  }

  async findFriendRequests(user: Users) {
    return await this.friendRepository.find({
      where: { friendname: user.intra_id, accept: false },
    });
  }

  async findFriendRequestsWithJoin(user: Users) {
    return await this.friendRepository.find({
      where: { friendname: user.intra_id, accept: false },
      relations: ['user'],
    });
  }

  async findFriendRequested(username: string) {
    return await this.friendRepository.find({
      where: { friendname: username },
    });
  }

  async findFriendRequestedWithJoin(username: string) {
    return await this.friendRepository.find({
      where: { friendname: username },
      relations: ['user'],
    });
  }

  async updateAccept(id: number, accept: boolean) {
    await this.friendRepository.update(id, { accept: accept });
  }

  async deleteRequest(friend: Friend) {
    await this.friendRepository.remove(friend);
  }
}
