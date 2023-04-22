import { Inject, Injectable } from '@nestjs/common';
import { ChatType, FriendReqType } from 'src/entity/common.enum';
import { IFriendRepository } from 'src/events/repository/friend.interface.repository';
import { IUserRepository } from 'src/user/repository/user.interface.repository';
import { UserService } from 'src/user/user.service';
import { IBanRepository } from './repository/ban.interface.repository';
import { IChatRepository } from './repository/chat.interface.repository';
import { IChatUserRepository } from './repository/chatuser.interface.repository';
import * as bcrypt from 'bcrypt';
import { GameService } from 'src/game/game.service';
import { User } from 'src/entity/user.entity';
import { IBlockRepository } from './repository/block.interface.repository';

@Injectable()
export class EventsService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IFriendRepository')
    private friendRepository: IFriendRepository,
    @Inject('IChatRepository')
    private chatRepository: IChatRepository,
    @Inject('IChatUserRepository')
    private chatUserRepository: IChatUserRepository,
    @Inject('IBanRepository')
    private banRepository: IBanRepository,
    @Inject('IBlockRepository')
    private blockRepository: IBlockRepository,
    private userService: UserService,
    private gameService: GameService,
  ) {}

  async disconnect(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithAll(socketId);
    if (user) {
      let result = [];
      if (user.chats) {
        result = [
          ...user.chats.map(async (chat) => {
            await this.leaveChat(socketId, chat.chat.title);
          }),
        ];
      }
      if (user.playGame) {
        // result = [
        //   ...result,
        //   ...user.playGame.map(async (game) => {
        //     await this.safd
        //   }),
        // ];
      }
      if (user.watchGame) {
        // result = [
        //   ...result,
        //   ...user.chats.map(async (chat) => {
        //     await this.leaveChat(socketId, chat.chat.title);
        //   }),
        // ];
      }
      await Promise.all(result);
      await this.userService.updateSocketId(user, '');
    }
  }

  async registUser(userName: string, socketId: string) {
    const user = await this.userRepository.findByUserName(userName);
    await this.userService.updateSocketId(user, socketId);
  }

  async isConnect(socketId: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const result = {
      userName: user.userName,
      isConnect: user !== null,
    };
    return result;
  }

  // testcode -> TODO: delete
  async getUserDtoFromSocketId(socketId: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    return this.userService.userToUserDto(user);
  }

  private async addDummyFriends(user: User) {
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
    const user1 = await this.userRepository.findByUserName('tmp4');
    const user2 = await this.userRepository.findByUserName('tmp5');
    const user3 = await this.userRepository.findByUserName('tmp6');
    const user4 = await this.userRepository.findByUserName('tmp7');
    const user5 = await this.userRepository.findByUserName('tmp8');
    const user6 = await this.userRepository.findByUserName('tmp9');
    await this.friendRepository.addFriend(user, user1, false);
    await this.friendRepository.addFriend(user, user2, false);
    await this.friendRepository.addFriend(user, user3, false);
    await this.friendRepository.addFriend(user4, user, false);
    await this.friendRepository.addFriend(user5, user, false);
    await this.friendRepository.addFriend(user6, user, false);
  }

  async getFriendList(socketId: string) {
    let user = await this.userService.getUserBySocketIdWithFriend(socketId);
    if (user.friends.length === 0) {
      // testcode -> TODO: delete
      await this.addDummyFriends(user);
      user = await this.userService.getUserBySocketIdWithFriend(socketId);
    }
    //return null
    const friends = user.friends.filter((friend) => friend.accept === true);
    const result = friends.map((friend) => {
      return {
        userName: friend.friendName,
        profile: friend.friendProfile,
        time: friend.time,
        type: FriendReqType.ACCEPT,
      };
    });
    return result;
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

  async creatChat(
    socketId: string,
    roomName: string,
    type: ChatType,
    password: string,
  ) {
    const user = await this.userService.getUserBySocketId(socketId);
    const exist = await this.chatRepository.findByTitle(roomName);
    if (exist)
      return { success: false, msg: `${roomName} 방이 이미 존재합니다.` };
    const chat = await this.chatRepository.createByChatDto(
      {
        title: roomName,
        type: type,
        operator: user.userName,
        count: 1,
      },
      password,
    );
    await this.chatUserRepository.addChatUser(chat, user);
    return {
      success: true,
      msg: `${roomName} 채팅방이 생성되었습니다.`,
      data: user.userName,
    };
  }

  async joinChat(socketId: string, roomName: string, password: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (
      chat.type === ChatType.PASSWORD &&
      !(await bcrypt.compare(password, chat.password))
    )
      return { success: false, msg: `비밀번호가 맞지 않습니다.` };
    const joined = chat.users.filter((usr) => usr.userName === user.userName);
    if (joined.length !== 0)
      return { success: false, msg: `${roomName}에 이미 참가 중 입니다.` };
    const ban = chat.banUsers.filter((ban) => ban.userName === user.userName);
    if (ban.length !== 0)
      return { success: false, msg: `${roomName}에 밴 되어있습니다.` };
    await this.chatUserRepository.addChatUser(chat, user);
    await this.chatRepository.updateCount(chat.id, chat.count + 1);
    const usernames = chat.users.map((usr) => {
      if (usr.user) return usr.user.userName;
      return '';
    });
    return {
      success: true,
      msg: `${user.userName}가 들어왔습니다.`,
      joinuser: user.userName,
      data: {
        roomName: roomName,
        operator: chat.operator,
        type: chat.type,
        users: usernames,
      },
    };
  }

  async leaveChat(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    const chatUser = await this.chatUserRepository.findByBoth(chat, user);
    if (chatUser.length === 0)
      return { success: false, msg: `참여 중인 방이 없습니다.` };
    await this.chatUserRepository.deleteChatUser(chatUser);
    if (chat.count <= 1) await this.chatRepository.deleteChat(chat);
    else {
      await this.chatRepository.updateCount(chat.id, chat.count - 1);
      if (chat.operator === user.userName) {
        await this.chatRepository.updateOperator(
          chat.id,
          chat.users[0].user.userName,
        );
      }
    }
    return {
      success: true,
      msg: `${user.userName}가 나갔습니다.`,
      data: user.userName,
    };
  }

  async getAllChatList(socketId: string) {
    const user = await this.userRepository.findBySocketIdWithJoinChat(socketId);

    const chats = await this.chatRepository.findAll();
    const chatsDto = chats.map((chat) => {
      return this.chatRepository.chatToChatDto(chat);
    });
    return { user: user.userName, chats: chatsDto };
  }

  async getChatList(socketId: string) {
    const user = await this.userRepository.findBySocketIdWithJoinChat(socketId);
    if (user.chats.length === 0) return { user: user.userName, chats: [] };
    const chatsDto = user.chats.map((chat) => {
      return this.chatRepository.chatToChatDto(chat.chat);
    });
    return { user: user.userName, chats: chatsDto };
  }

  async getUserList(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    const usersDto = chat.users.map((usr) => {
      return this.userService.userToUserDto(usr.user);
    });
    return { user: user.userName, users: usersDto };
  }

  async kickUser(socketId: string, roomName: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const data = chat.users.filter((usr) => usr.user.userName === userName);
    if (data.length === 0)
      return { success: false, msg: `${roomName}에 ${userName}가 없습니다.` };
    const kicked = await this.userService.getUserByUserName(userName);
    const chatuser = await this.chatUserRepository.findByBoth(chat, kicked);
    await this.chatUserRepository.deleteChatUser(chatuser);
    await this.chatRepository.updateCount(chat.id, chat.count - 1);
    return {
      success: true,
      msg: `${userName}가 ${roomName}에서 강퇴되었습니다.`,
      data: kicked.socketId,
    };
  }

  async muteUser(socketId: string, roomName: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const muted = await this.userService.getUserByUserName(userName);
    if (!muted) return { success: false, msg: `${userName} 유저가 없습니다.` };
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const data = chat.users.filter((usr) => usr.userName === userName);
    if (data.length === 0)
      return { success: false, msg: `${roomName}에 ${userName}가 없습니다.` };
    return {
      success: true,
      data: muted.socketId,
    };
  }

  async changePassword(socketId: string, roomName: string, password: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    await this.chatRepository.updatePassword(chat, password);
    return {
      success: true,
      msg: `${roomName}의 비밀번호가 바뀌었습니다.`,
    };
  }

  async changeOperator(socketId: string, roomName: string, operator: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const data = chat.users.filter((usr) => usr.user.userName === operator);
    if (data.length === 0)
      return { success: false, msg: `${roomName}에 ${operator}가 없습니다.` };
    await this.chatRepository.updateOperator(chat.id, operator);
    return {
      success: true,
      data: { roomName, operator },
    };
  }

  async banUser(socketId: string, roomName: string, banUser: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${user.userName}의 방장이 아닙니다.` };
    const isBan = chat.banUsers.filter((ban) => ban.username === banUser);
    if (isBan.length !== 0)
      return { success: false, msg: `${banUser}는 이미 밴 되어있습니다.` };
    await this.banRepository.addBanUser(chat, banUser);
    return { success: true, msg: `${banUser}가 밴 되었습니다.` };
  }

  async banCancel(socketId: string, roomName: string, banUser: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${user.userName}의 방장이 아닙니다.` };
    const ban = chat.banUsers.filter((ban) => ban.username === banUser);
    if (ban.length === 0)
      return { success: false, msg: `${banUser}는 밴 되어있지 않습니다.` };
    await this.banRepository.deleteBanUser(ban);
    return { success: true, msg: `${banUser}의 밴이 취소되었습니다.` };
  }

  async getBanList(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const users = chat.banUsers.map((usr) => {
      return usr.user.userName;
    });
    return {
      success: true,
      msg: `${roomName} 밴 유저 리스트 요청 완료`,
      data: users,
    };
  }

  async getBlockList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithBlock(socketId);
    const blockUsers = user.blockUsers.map((usr) => {
      return usr.user.blockuser;
    });
    return blockUsers;
  }

  async blockUser(socketId: string, blockUser: string) {
    const user = await this.userService.getUserBySocketIdWithBlock(socketId);
    const isBan = user.blockUsers.filter(
      (block) => block.blockUser === blockUser,
    );
    if (isBan.length !== 0)
      return { success: false, msg: `${blockUser}는 이미 차단 되어있습니다.` };
    await this.blockRepository.addBlockUser(user, blockUser);
    return { success: true, msg: `${blockUser}가 차단 되었습니다.` };
  }

  async blockCancel(socketId: string, blockUser: string) {
    const user = await this.userService.getUserBySocketIdWithBlock(socketId);
    const block = user.blockUsers.filter(
      (block) => block.blockUser === blockUser,
    );
    if (block.length === 0)
      return { success: false, msg: `${blockUser}는 차단 되어있지 않습니다.` };
    await this.blockRepository.deleteBlockUser(block);
    return { success: true, msg: `${blockUser}의 차단이 해제되었습니다.` };
  }

  async gameAlert(roomName: string, message: string) {
    const players = await this.gameService.getGamePlayers(roomName);
    const data = players.map((player) => {
      return {
        userName: player.userName,
        message: `${player.userName}` + message,
      };
    });
    return data;
  }
}
