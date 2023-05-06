import { Inject, Injectable } from '@nestjs/common';
import { FriendReqType, UserStatusType } from 'src/entity/common.enum';
import { User } from 'src/entity/user.entity';
import { IFriendRepository } from 'src/friend/repository/friend.interface.repository';
import { IsolationLevel, Transactional } from 'typeorm-transactional';

@Injectable()
export class FriendService {
  constructor(
    @Inject('IFriendRepository')
    private friendRepository: IFriendRepository,
  ) {}

  async getFriendList(user: User) {
    const friends = user.friends.filter((friend) => friend.accept === true);
    const result = friends.map(async (friend) => {
      let status: UserStatusType;
      if (friend.user.socketId === '') status = UserStatusType.OFFLINE;
      else if (!friend.user.playGame) status = UserStatusType.ONLINE;
      else status = UserStatusType.PLAYING;
      return {
        userName: friend.friendName,
        profile: friend.friendProfile,
        time: friend.time,
        status: status,
      };
    });
    return await Promise.all(result);
  }

  getFriendRequestSend(user: User) {
    const send = user.friends.filter((friend) => friend.accept === false);
    const sendDto = send.map((friend) => {
      return {
        userName: friend.friendName,
        profile: friend.friendProfile,
        time: friend.time,
        type: FriendReqType.SEND,
      };
    });
    return sendDto;
  }

  async getFriendRequestReceive(user: User) {
    const receive = await this.friendRepository.findFriendRequestedWithJoin(
      user.userName,
    );
    const receiveDto = receive.map((friend) => {
      return {
        userName: friend.user.userName,
        profile: friend.user.profile,
        time: friend.time,
        type: FriendReqType.RECEIVE,
      };
    });
    return receiveDto;
  }

  private requestCheck(reqs, findName) {
    if (!reqs) return false;
    const tmp = reqs.filter((req) => req.friendName === findName);
    if (tmp.length !== 0) return true;
    return false;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async friendRequest(user: User, friend: User) {
    const userReqs = await this.friendRepository.findAllWithJoin(user);
    if (this.requestCheck(userReqs, friend.userName)) return false;
    await this.friendRepository.addFriend(user, friend, false);
    return true;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async friendResponse(user: User, friend: User, type: boolean) {
    const requests = friend.friends.filter(
      (req) => req.friendName === user.userName && req.accept === false,
    );
    if (requests.length !== 1) return false;
    if (type) {
      await this.friendRepository.updateAccept(requests[0].id, true);
      await this.friendRepository.addFriend(user, friend, true);
    } else await this.friendRepository.deleteFriend(requests[0]);
    return true;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async cancelFriend(user: User, friend: User) {
    const requests = user.friends.filter(
      (req) => req.friendName === friend.userName && req.accept === false,
    );
    if (requests.length === 0) return false;
    await this.friendRepository.deleteFriend(requests[0]);
    return true;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async deleteFriend(user: User, friend: User) {
    const userRelation = user.friends.filter(
      (req) => req.friendName === friend.userName && req.accept === true,
    );
    const friendRelation = friend.friends.filter(
      (req) => req.friendName === user.userName && req.accept === true,
    );
    if (userRelation.length === 0 || friendRelation.length === 0) return false;
    if (userRelation.length !== 0)
      await this.friendRepository.deleteFriend(userRelation[0]);
    if (friendRelation.length !== 0)
      await this.friendRepository.deleteFriend(friendRelation[0]);
    return true;
  }
}
