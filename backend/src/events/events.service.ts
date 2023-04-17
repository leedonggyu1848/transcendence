import { Inject, Injectable } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { UserDto } from 'src/dto/user.dto';
import { ChatType } from 'src/entity/common.enum';
import { IFriendRepository } from 'src/friend/repository/friend.interface.repository';
import { IUserRepository } from 'src/user/repository/users.interface.repository';
import { UserService } from 'src/user/user.service';
import { IBanRepository } from './repository/ban.interface.repository';
import { IChatRepository } from './repository/chat.interface.repository';
import { IChatUserRepository } from './repository/chatuser.interface.repository';

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
    private userService: UserService,
  ) {}

  async registUser(intra_id: string, socket_id: string) {
    const user = await this.userRepository.findByIntraId(intra_id);
    await this.userRepository.updateSocketId(user.id, socket_id);
  }

  requestCheck(reqs, findName) {
    if (!reqs) return false;
    const tmp = reqs.filter((req) => req.friendname === findName);
    if (tmp.length !== 0) return true;
    return false;
  }

  async getUserDtoFromSocketId(socketId: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    return this.userService.userToUserDto(user);
  }

  async friendRequest(socketId: string, friendName: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    const friend = await this.userService.findUserByIntraId(friendName);
    if (!friend) return { success: false, msg: '없는 유저입니다.' };
    const userReqs = await this.friendRepository.findAllWithJoin(user);
    const friendReqs = await this.friendRepository.findAllWithJoin(friend);
    if (
      this.requestCheck(userReqs, friendName) ||
      this.requestCheck(friendReqs, user.intra_id)
    )
      return { success: false, msg: '이미 친구 신청을 보냈습니다.' };
    await this.friendRepository.addFriend(user, friendName);
    return { success: true, msg: '친구 요청을 보냈습니다.' };
  }

  async friendResponse(socketId: string, friendName: string, type: boolean) {
    const user = await this.userService.findUserBySocketId(socketId);
    const friend = await this.userService.findUserByIntraId(friendName);
    if (!friend) return { success: false, msg: '없는 유저입니다.' };
    const requests = await this.friendRepository.findFriendRequests(user);
    const myRequests = requests.find(
      (request) => request.friendName === friend.intra_id,
    );
    if (!myRequests)
      return { success: false, msg: '친구 신청이 없거나 이미 처리되었습니다.' };
    if (type) await this.friendRepository.updateAccept(myRequests.id, true);
    else await this.friendRepository.deleteRequest(myRequests.id);
    return { success: true, msg: '친구 신청이 처리되었습니다.' };
  }

  async creatChat(
    socketId: string,
    roomName: string,
    type: ChatType,
    password: string,
  ) {
    const user = await this.userService.findUserBySocketId(socketId);
    const exist = await this.chatRepository.findByTitle(roomName);
    if (exist)
      return { success: false, msg: `${roomName} 방이 이미 존재합니다.` };
    const chat = await this.chatRepository.createByChatDto(
      {
        title: roomName,
        type: type,
        operator: user.intra_id,
        count: 1,
      },
      password,
    );
    await this.chatUserRepository.addChatUser(chat, user);
    return {
      success: true,
      msg: `${roomName} 채팅방이 생성되었습니다.`,
      data: user.intra_id,
    };
  }

  async joinChat(socketId: string, roomName: string, password: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.type === ChatType.PASSWORD && chat.password !== password)
      return { success: false, msg: `비밀번호가 맞지 않습니다.` };
    const joined = chat.users.filter((usr) => usr.intra_id === user.intra_id);
    if (joined.length !== 0)
      return { success: false, msg: `${roomName}에 이미 참가 중 입니다.` };
    const ban = chat.banUsers.filter((ban) => ban.username === user.intra_id);
    if (ban.length !== 0)
      return { success: false, msg: `${roomName}에 밴 되어있습니다.` };
    await this.chatUserRepository.addChatUser(chat, user);
    await this.chatRepository.updateCount(chat.id, chat.count + 1);
    return {
      success: true,
      msg: `${user.intra_id}가 ${roomName}에 들어왔습니다.`,
      data: this.userService.userToUserDto(user),
    };
  }

  async leaveChat(socketId: string, roomName: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    const chatUser = await this.chatUserRepository.findByBoth(chat, user);
    if (chatUser.length === 0)
      return { success: false, msg: `참여 중인 방이 없습니다.` };
    await this.chatUserRepository.deleteChatUser(chatUser.id);
    if (chat.count <= 1) await this.chatRepository.deleteChat(chat.id);
    else {
      await this.chatRepository.updateCount(chat.id, chat.count - 1);
      if (chat.operator === user.intra_id) {
        await this.chatRepository.updateOperator(
          chat.id,
          chat.users[0].intra_id,
        );
      }
    }
    return {
      success: true,
      msg: `${user.intra_id}가 ${roomName}에서 나갔습니다.`,
      data: this.userService.userToUserDto(user),
    };
  }

  async getAllChatList(socketId: string) {
    const user = await this.userRepository.findBySocketIdWithJoinChat(socketId);
    const chats = await this.chatRepository.findAll();
    const chatsDto = chats.map((chat) => {
      return this.chatRepository.chatToChatDto(chat);
    });
    return { user: user.intra_id, chats: chatsDto };
  }

  async getChatList(socketId: string) {
    const user = await this.userRepository.findBySocketIdWithJoinChat(socketId);
    const chatsDto = user.chats.map((chat) => {
      return this.chatRepository.chatToChatDto(chat.chat);
    });
    return { user: user.intra_id, chats: chatsDto };
  }

  async getUserList(socketId: string, roomName: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    const usersDto = chat.users.map((usr) => {
      return this.userService.userToUserDto(usr);
    });
    return { user: user.intra_id, users: usersDto };
  }

  async kickUser(socketId: string, roomName: string, userName: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.intra_id)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const data = chat.users.filter((usr) => usr.intra_id === userName);
    if (data.length === 0)
      return { success: false, msg: `${roomName}에 ${userName}가 없습니다.` };
    const kicked = await this.userService.findUserByIntraId(userName);
    const chatuser = await this.chatUserRepository.findByBoth(chat, kicked);
    await this.chatUserRepository.deleteChatUser(chatuser.id);
    await this.chatRepository.updateCount(chat.id, chat.count - 1);
    return {
      success: true,
      msg: `${userName}가 ${roomName}에서 강퇴되었습니다.`,
      data: kicked.socket_id,
    };
  }

  async changeOperator(socketId: string, roomName: string, operator: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.intra_id)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const data = chat.users.filter((usr) => usr.intra_id === operator);
    if (data.length === 0)
      return { success: false, msg: `${roomName}에 ${operator}가 없습니다.` };
    await this.chatRepository.updateOperator(chat.id, operator);
    return {
      success: true,
      msg: `${roomName}의 방장이 ${user.intra_id}으로 바뀌었습니다.`,
      data: this.userService.userToUserDto(user),
    };
  }

  async banUser(socketId: string, roomName: string, banUser: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.intra_id)
      return { success: false, msg: `${user.intra_id}의 방장이 아닙니다.` };
    const ban = chat.banUsers.find((ban) => ban.username === user.intra_id);
    if (ban.length !== 0)
      return { success: false, msg: `${banUser}는 이미 밴 되어있습니다.` };
    await this.banRepository.addBanUser(chat, banUser);
    return { success: true, msg: `${banUser} is banned` };
  }

  async cancleBan(socketId: string, roomName: string, banUser: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    const userId = user.intra_id;
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== userId)
      return { success: false, msg: `${userId}의 방장이 아닙니다.` };
    const ban = chat.banUsers.find((ban) => ban.username === userId);
    if (ban.length === 0)
      return { success: false, msg: `${userId}는 밴 되어있지 않습니다.` };
    await this.banRepository.deleteBanUser(ban.id);
    return { success: true, msg: `${banUser}의 밴이 취소되었습니다.` };
  }

  async getBanList(socketId: string, roomName: string) {
    const user = await this.userService.findUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.intra_id)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    return {
      success: true,
      msg: `${roomName} 밴 유저 리스트 요청 완료`,
      data: chat.users,
    };
  }
}