import { Inject, Injectable } from '@nestjs/common';
import { Friend } from 'src/entity/friend.entity';
import { Users } from 'src/entity/user.entity';
import { IFriendRepository } from 'src/friend/repository/friend.interface.repository';
import { IUserRepository } from 'src/user/repository/users.interface.repository';

@Injectable()
export class FriendService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IFriendRepository')
    private friendRepository: IFriendRepository,
  ) {}

  async requestFriend(user: Users, friend: Users) {
    const user_req = await this.friendRepository.findAll(user);
    const friend_req = await this.friendRepository.findAll(friend);
    if (user_req || friend_req)
      return { success: false, data: '이미 친구 신청을 보냈습니다.' };
    await this.friendRepository.addFriend(user, friend.intra_id);
    return { success: true, data: null };
  }

  async acceptFriend(user: Users, friend: Users) {
    const requests = await this.friendRepository.findFriendRequests(user);
    const req = requests.find((name) => name.friendname === friend.intra_id);
    if (!req)
      return {
        success: false,
        data: '친구 신청이 없거나 이미 처리되었습니다.',
      };
    await this.friendRepository.updateAccept(req.id, true);
    return { success: true, data: null };
  }

  async getFriendList(user: Users) {
    const friends = await this.friendRepository.findFriends(user);
    if (friends.length === 0) return null;
    const result = friends.map(async (friend) => {
      const data = await this.userRepository.findByIntraId(friend.friendname);
      return this.friendRepository.userToFriendDto(data, friend.time);
    });
    return await Promise.all(result);
  }

  async getFriendRequestList(user: Users) {
    const send = await this.friendRepository.findFriendRequests(user);
    const receive = await this.friendRepository.findFriendRequested(
      user.intra_id,
    );
    const sendDto = send.map(async (friend) => {
      const data = await this.userRepository.findByIntraId(friend.intra_id);
      return await this.friendRepository.userToFriendDto(data, friend.time);
    });
    const receiveDto = receive.map(async (friend) => {
      const data = await this.userRepository.findByIntraId(friend.intra_id);
      return await this.friendRepository.userToFriendDto(data, friend.time);
    });

    return {
      send: await Promise.all(sendDto),
      receive: await Promise.all(receiveDto),
    };
  }

  // testcode -> TODO: delete
  async addDummyFriends(user: Users) {
    await this.userRepository.createUser(1122, 'tmp1');
    await this.userRepository.createUser(1123, 'tmp2');
    await this.userRepository.createUser(1124, 'tmp3');
    await this.userRepository.createUser(1125, 'tmp4');
    await this.userRepository.createUser(1126, 'tmp5');
    await this.userRepository.createUser(1127, 'tmp6');
    await this.userRepository.createUser(1128, 'tmp7');
    await this.userRepository.createUser(1129, 'tmp8');
    await this.userRepository.createUser(1130, 'tmp9');
    await this.friendRepository.addDummyFriend(user, 'tmp1');
    await this.friendRepository.addDummyFriend(user, 'tmp2');
    await this.friendRepository.addDummyFriend(user, 'tmp3');
    await this.friendRepository.addFriend(user, 'tmp4');
    await this.friendRepository.addFriend(user, 'tmp5');
    await this.friendRepository.addFriend(user, 'tmp6');
    const user1 = await this.userRepository.findByIntraId('tmp7');
    const user2 = await this.userRepository.findByIntraId('tmp8');
    const user3 = await this.userRepository.findByIntraId('tmp9');
    await this.friendRepository.addFriend(user1, user.intra_id);
    await this.friendRepository.addFriend(user2, user.intra_id);
    await this.friendRepository.addFriend(user3, user.intra_id);
  }
}
