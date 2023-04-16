import { InjectRepository } from '@nestjs/typeorm';
import { FriendDto } from 'src/dto/friend.dto';
import { friendReqType } from 'src/entity/common.enum';
import { Friend } from 'src/entity/friend.entity';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

export class FriendRepository {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
  ) {}

  userToFriendDto(user: Users, time: Date, type: friendReqType) {
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
      where: { user: user },
    });
  }

  async findAllWithJoin(user: Users) {
    return await this.friendRepository.find({
      where: { user: user },
      relations: ['user'],
    });
  }

  async findFriends(user: Users) {
    return await this.friendRepository.find({
      where: { user: user, accept: true },
    });
  }

  async findFriendsWithJoin(user: Users) {
    return await this.friendRepository.find({
      where: { user: user, accept: true },
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
}
