import { Inject, Injectable } from '@nestjs/common';
import { FriendReqType, UserStatusType } from 'src/entity/common.enum';
import { User } from 'src/entity/user.entity';
import { IFriendRepository } from 'src/friend/repository/friend.interface.repository';
import { IUserRepository } from 'src/user/repository/user.interface.repository';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FriendService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IFriendRepository')
    private friendRepository: IFriendRepository,
    private userService: UserService,
  ) {}

  async getFriendList(socketId: string) {
    let user = await this.userService.getUserBySocketIdWithFriend(socketId);
    if (user.friends.length === 0) return null;
    const friends = user.friends.filter((friend) => friend.accept === true);
    const result = friends.map(async (friend) => {
      const found = await this.userService.getUserByUserNameWithGame(
        friend.friendName,
      );
      let status: UserStatusType;
      if (found.socketId === '') status = UserStatusType.OFFLINE;
      else if (!found.playGame) status = UserStatusType.ONLINE;
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

  async getFriendRequestList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithFriend(socketId);
    const send = await user.friends.filter((friend) => friend.accept === false);
    const receive = await this.friendRepository.findFriendRequestedWithJoin(
      user.userName,
    );
    const sendDto = send.map((friend) => {
      return {
        userName: friend.friendName,
        profile: friend.friendProfile,
        time: friend.time,
        type: FriendReqType.SEND,
      };
    });
    const receiveDto = receive.map((friend) => {
      return {
        userName: friend.user.userName,
        profile: friend.user.profile,
        time: friend.time,
        type: FriendReqType.RECEIVE,
      };
    });
    const result = [...sendDto, ...receiveDto];
    return result;
  }

  private requestCheck(reqs, findName) {
    if (!reqs) return false;
    const tmp = reqs.filter((req) => req.friendName === findName);
    if (tmp.length !== 0) return true;
    return false;
  }

  async friendRequest(socketId: string, friendName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const friend = await this.userService.getUserByUserName(friendName);
    if (!friend) return { success: false, msg: '없는 유저입니다.' };
    const userReqs = await this.friendRepository.findAllWithJoin(user);
    if (this.requestCheck(userReqs, friendName))
      return { success: false, msg: '이미 친구 신청을 보냈습니다.' };
    await this.friendRepository.addFriend(user, friend, false);
    return {
      success: true,
      data: { user, friend },
      msg: `${user.userName}가 ${friendName}에게 친구 신청을 보냈습니다.`,
    };
  }

  async friendResponse(socketId: string, friendName: string, type: boolean) {
    const user = await this.userService.getUserBySocketId(socketId);
    const friend = await this.userService.getUserByUserNameWithFriend(
      friendName,
    );
    if (!friend) return { success: false, msg: '없는 유저입니다.' };
    const requests = friend.friends.filter(
      (req) => req.friendName === user.userName && req.accept === false,
    );
    if (requests.length !== 1)
      return { success: false, msg: '친구 신청이 없거나 이미 처리되었습니다.' };
    if (type) {
      await this.friendRepository.updateAccept(requests[0].id, true);
      await this.friendRepository.addFriend(user, friend, true);
    } else await this.friendRepository.deleteFriend(requests[0]);
    return {
      success: true,
      data: friend.socketId,
      sender: { userName: friendName, profile: friend.profile, type: type },
      receiver: {
        userName: user.userName,
        profile: user.profile,
        type: type,
      },
      msg: `${user.userName}와 ${friendName}의 친구 신청이 처리 되었습니다.`,
    };
  }

  async cancelFriend(socketId: string, friendName: string) {
    const user = await this.userService.getUserBySocketIdWithFriend(socketId);
    const friend = await this.userService.getUserByUserName(friendName);
    const requests = user.friends.filter(
      (req) => req.friendName === friendName && req.accept === false,
    );
    if (requests.length === 0)
      return { success: false, msg: `${friendName}에게 보낸 요청이 없습니다.` };
    const data = friend.socketId;
    await this.friendRepository.deleteFriend(requests[0]);
    return {
      success: true,
      data: data,
      userName: user.userName,
    };
  }

  async deleteFriend(socketId: string, friendName: string) {
    const user = await this.userService.getUserBySocketIdWithFriend(socketId);
    const friend = await this.userService.getUserByUserNameWithFriend(
      friendName,
    );
    if (!friend) return { success: false, msg: '없는 유저입니다.' };
    const userRelation = user.friends.filter(
      (req) => req.friendName === friendName && req.accept === true,
    );
    const friendRelation = friend.friends.filter(
      (req) => req.friendName === user.userName && req.accept === true,
    );
    if (userRelation.length === 0 || friendRelation.length === 0)
      return { success: false, msg: `${friendName} 유저와 친구가 아닙니다.` };
    if (userRelation.length !== 0)
      await this.friendRepository.deleteFriend(userRelation[0]);
    if (friendRelation.length !== 0)
      await this.friendRepository.deleteFriend(friendRelation[0]);
    return { success: true, data: friend.socketId, userName: user.userName };
  }
}
