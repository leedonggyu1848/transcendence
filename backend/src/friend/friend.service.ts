import { Inject, Injectable } from '@nestjs/common';
import { FriendReqType } from 'src/entity/common.enum';
import { User } from 'src/entity/user.entity';
import { IFriendRepository } from 'src/friend/repository/friend.interface.repository';
import { IUserRepository } from 'src/user/repository/user.interface.repository';

@Injectable()
export class FriendService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IFriendRepository')
    private friendRepository: IFriendRepository,
  ) {}

  async getFriendList(user: User) {
    const friends = await this.friendRepository.findFriends(user);
    if (friends.length === 0) return null;
    const result = friends.map(async (friend) => {
      const data = await this.userRepository.findByIntraId(friend.friendname);
      return this.friendRepository.userToFriendDto(
        data,
        friend.time,
        FriendReqType.ACCEPT,
      );
    });
    return await Promise.all(result);
  }

  async getFriendRequestList(user: User) {
    const send = await this.friendRepository.findFriendRequests(user);
    const receive = await this.friendRepository.findFriendRequestedWithJoin(
      user.intra_id,
    );
    const sendDto = send.map(async (friend) => {
      const data = await this.userRepository.findByIntraId(friend.intra_id);
      return await this.friendRepository.userToFriendDto(
        data,
        friend.time,
        FriendReqType.SEND,
      );
    });
    const receiveDto = receive.map(async (friend) => {
      return await this.friendRepository.userToFriendDto(
        friend.user,
        friend.time,
        FriendReqType.RECEIVE,
      );
    });
    const result = [
      ...(await Promise.all(sendDto)),
      ...(await Promise.all(receiveDto)),
    ];
    return result;
  }

  // testcode -> TODO: delete
  async addDummyFriends(user: User) {
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
