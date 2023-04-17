import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { UserDto } from 'src/dto/user.dto';
import { ChatType } from 'src/entity/common.enum';
import { IFriendRepository } from 'src/friend/repository/friend.interface.repository';
import { IUserRepository } from 'src/user/repository/users.interface.repository';
import { IBanRepository } from './repository/ban.interface.repository';
import { IChatRepository } from './repository/chat.interface.repository';
import { IChatUserRepository } from './repository/chatuser.interface.repository';

@WebSocketGateway({
  namespace: 'GameChat',
  cors: {
    origin: ['http://localhost:5173'],
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(EventsGateway.name);
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
  ) {}

  @WebSocketServer() nsp: Namespace;

  afterInit() {
    this.logger.log('웹소켓 서버 초기화');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결`);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결 해제`);
  }

  @SubscribeMessage('first-connection')
  async handleSocketConnect(
    @ConnectedSocket() socket: Socket,
    @MessageBody() intra_id: string,
  ) {
    this.logger.log(`connect ${socket.id} to ${intra_id}`);
    const user = await this.userRepository.findByIntraId(intra_id);
    await this.userRepository.updateSocketId(user.id, socket.id);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomName,
      userName,
      message,
    }: { roomName: string; userName: string; message: string },
  ) {
    this.logger.log(`${roomName} message => ${userName}: ${message}`);
    socket.broadcast
      .to(roomName)
      .emit('message', { username: userName, message });
    return { username: socket.id, message };
  }

  @SubscribeMessage('create-game')
  handleCreateGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    if (this.nsp.adapter.rooms.has(roomName)) {
      this.logger.log(`fail: game ${roomName} 방이 이미 존재합니다.`);
      return;
    }
    this.logger.log(`Game ${roomName} is created`);
    socket.join(roomName);
    this.nsp.emit('create-game', roomName);
  }

  @SubscribeMessage('join-game')
  async handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, type }: { roomName: string; type: string },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`${user.intra_id} join game ${roomName} as ${type}`);
    socket.join(roomName);
    socket.broadcast.to(roomName).emit('join-game', {
      message: `${user.intra_id}가 들어왔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
      type: type,
    });
  }

  @SubscribeMessage('leave-game')
  async handleLeaveGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, type }: { roomName: string; type: string },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`${user.intra_id} leave game ${roomName} as ${type}`);
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit('leave-game', {
      message: `${user.intra_id}가 나갔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
      type: type,
    });
  }

  private requestCheck(reqs, findName) {
    if (!reqs) return false;
    const tmp = reqs.filter((req) => req.friendname === findName);
    if (tmp.length !== 0) return true;
    return false;
  }

  @SubscribeMessage('send-friend')
  async handleFriendRequest(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`Friend request: ${user.intra_id} to ${friendName}`);
    const friend = await this.userRepository.findByIntraId(friendName);
    if (!friend) {
      this.logger.log(`fail: 없는 유저입니다.`);
      socket.emit('friend-fail', '없는 유저입니다.');
      return;
    }
    const user_reqs = await this.friendRepository.findAllWithJoin(user);
    const friend_reqs = await this.friendRepository.findAllWithJoin(friend);
    if (
      this.requestCheck(user_reqs, friendName) ||
      this.requestCheck(friend_reqs, user.intra_id)
    ) {
      this.logger.log('fail: 이미 친구 신청을 보냈습니다.');
      socket.emit('friend-fail', '이미 친구 신청을 보냈습니다.');
      return;
    }
    await this.friendRepository.addFriend(user, friendName);
    socket.emit('friend-success', '친구 요청을 보냈습니다.');
  }

  @SubscribeMessage('response-friend')
  async handleAcceptFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { friendName, type }: { friendName: string; type: boolean },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`Friend accept: ${user.intra_id} to ${friendName}`);
    const friend = await this.userRepository.findByIntraId(friendName);
    if (!friend) {
      this.logger.log(`fail: 없는 유저입니다.`);
      socket.emit('friend-fail', '없는 유저입니다.');
      return;
    }
    const reqs = await this.friendRepository.findFriendRequests(user);
    const data = reqs.find((req) => req.friendname === friend.intra_id);
    if (!data) {
      this.logger.log(`fail: 친구 신청이 없거나 이미 처리되었습니다.`);
      socket.emit('friend-fail', '친구 신청이 없거나 이미 처리되었습니다.');
      return;
    }
    if (type) await this.friendRepository.updateAccept(data.id, true);
    else await this.friendRepository.deleteRequest(data.id);
    socket.emit('friend-fail', '친구 신청이 처리되었습니다.');
  }

  @SubscribeMessage('create-chat')
  async handleCreateChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomName,
      type,
      password,
    }: { roomName: string; type: ChatType; password: string },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    const exist = await this.chatRepository.findByTitle(roomName);
    if (exist) {
      this.logger.log(`fail: chat ${roomName} 방이 이미 존재합니다.`);
      socket.emit('chat-fail', `${roomName} 방이 이미 존재합니다.`);
      return;
    }
    const chat = await this.chatRepository.createByChatDto({
      title: roomName,
      type: type,
      password: password,
      operator: user.intra_id,
      count: 1,
    });
    await this.chatUserRepository.addChatUser(chat, user);
    socket.join(roomName);
    this.logger.log(`chat ${roomName} is created`);
    this.nsp.emit('create-chat', { roomName, type });
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, password }: { roomName: string; password: string },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.type === ChatType.PASSWORD && chat.password !== password) {
      this.logger.log(`${password} 비밀번호가 맞지 않습니다.`);
      socket.emit('chat-fail', `비밀번호가 맞지 않습니다.`);
      return;
    }
    const joined = chat.users.filter((usr) => usr.intra_id === user.intra_id);
    if (joined.length !== 0) {
      this.logger.log(`${roomName}에 이미 참가 중 입니다.`);
      socket.emit('chat-fail', `${roomName}에 이미 참가 중 입니다.`);
      return;
    }
    const ban = chat.banUsers.filter(
      (banUser) => banUser.username === user.intra_id,
    );
    if (ban.length !== 0) {
      this.logger.log(`${user.intra_id}는 ${roomName}에 밴 되어있습니다.`);
      socket.emit('chat-fail', `${roomName}에 접속할 수 없습니다.`);
      return;
    }
    this.chatUserRepository.addChatUser(chat, user);
    this.chatRepository.updateCount(chat.id, chat.count + 1);
    socket.join(roomName);
    this.logger.log(`${user.intra_id} join chat ${roomName}`);
    this.nsp.emit('join-chat', {
      message: `${user.intra_id}가 들어왔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
    });
  }

  @SubscribeMessage('leave-chat')
  async handleLeaveChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    const chat = await this.chatRepository.findByTitle(roomName);
    const chatUser = await this.chatUserRepository.findByBoth(chat, user);
    if (chatUser.length === 0) {
      this.logger.log(`fail: 참여 중인 방이나 ${roomName} 방이 없습니다.`);
      socket.emit('chat-fail', `참여 중인 방이나 ${roomName} 방이 없습니다.`);
      return;
    }
    this.chatUserRepository.deleteChatUser(chatUser.id);
    this.chatRepository.updateCount(chat.id, chat.count - 1);
    socket.leave(roomName);
    this.logger.log(`${user.intra_id}가 ${roomName}에서 나갔습니다.`);
    this.nsp.emit('leave-chat', {
      message: `${user.intra_id}가 나갔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
    });
  }

  @SubscribeMessage('all-chat')
  async handleAllChatList(@ConnectedSocket() socket: Socket) {
    const user = await this.userRepository.findBySocketIdWithJoinChat(
      socket.id,
    );
    const chats = await this.chatRepository.findAll();
    this.logger.log(`All chat request: ${user.intra_id}`);
    socket.emit('all-chat', { chats: chats });
  }

  @SubscribeMessage('chat-list')
  async handleChatList(@ConnectedSocket() socket: Socket) {
    const user = await this.userRepository.findBySocketIdWithJoinChat(
      socket.id,
    );
    this.logger.log(`Chat list request: ${user.intra_id}`);
    socket.emit('chat-list', { chats: user.chats });
  }

  @SubscribeMessage('user-list')
  async handleUserList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    this.logger.log(`Users of ${roomName} request: ${user.intra_id}`);
    socket.emit('user-list', { users: chat.users });
  }

  @SubscribeMessage('kick-user')
  async handleKickUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userName },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.intra_id) {
      this.logger.log(`fail: ${roomName}의 방장이 아닙니다.`);
      socket.emit('chat-fail', `${roomName}의 방장이 아닙니다.`);
      return;
    }
    const data = chat.users.filter((usr) => usr.intra_id === userName);
    if (data.length === 0) {
      this.logger.log(`fail: ${roomName}에 ${userName}가 없습니다.`);
      socket.emit('chat-fail', `${roomName}에 ${userName}가 없습니다.`);
      return;
    }
    const kicked = await this.userRepository.findByIntraId(userName);
    const chatuser = await this.chatUserRepository.findByBoth(chat, kicked);
    await this.chatUserRepository.deleteChatUser(chatuser.id);
    await this.chatRepository.updateCount(chat.id, chat.count - 1);
    this.logger.log(`${user.intra_id} kick ${userName} from ${roomName}`);
    const rooms = await this.nsp.in(roomName).fetchSockets();
    if (rooms.some((socket) => socket.id === kicked.socket_id)) {
      this.nsp.in(roomName).emit('kick-user', { userName });
      await this.nsp.sockets.get(userName)?.leave(roomName);
    }
  }

  @SubscribeMessage('change-oper')
  async handleChangeOper(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, operator }: { roomName: string; operator: string },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`Change operator of ${roomName} as ${user.intra_id}`);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.intra_id) {
      this.logger.log(`fail: ${roomName}의 방장이 아닙니다.`);
      socket.emit('chat-fail', `${roomName}의 방장이 아닙니다.`);
      return;
    }
    const data = chat.users.filter((usr) => usr.intra_id === operator);
    if (data.length === 0) {
      this.logger.log(`fail: ${roomName}에 ${operator}가 없습니다.`);
      socket.emit('chat-fail', `${roomName}에 ${operator}가 없습니다.`);
      return;
    }
    await this.chatRepository.updateOperator(chat.id, operator);
    socket.broadcast.to(roomName).emit('change-oper', {
      message: `${roomName}의 방장이 ${user.intra_id}으로 바뀌었습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
    });
  }

  @SubscribeMessage('ban-user')
  async handleBanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userInfo }: { roomName: string; userInfo: UserDto },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.intra_id) {
      this.logger.log(`fail: ${user.intra_id}의 방장이 아닙니다.`);
      socket.emit('chat-fail', `${user.intra_id}의 방장이 아닙니다.`);
      return;
    }
    const ban = chat.banUsers.find(
      (banUser) => banUser.username === user.intra_id,
    );
    if (ban.length !== 0) {
      this.logger.log(`fail: ${userInfo.intra_id}는 이미 밴 되어있습니다.`);
      socket.emit('chat-fail', `${userInfo.intra_id}는 이미 밴 되어있습니다.`);
      return;
    }
    await this.banRepository.addBanUser(chat, userInfo.intra_id);
    this.logger.log(`Ban: ${userInfo.intra_id} on ${roomName}`);
    socket.emit('ban-user', `${userInfo.intra_id} is banned`);
  }

  @SubscribeMessage('ban-cancle')
  async handleCancleUserBan(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userInfo }: { roomName: string; userInfo: UserDto },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.intra_id) {
      this.logger.log(`fail: ${user.intra_id}의 방장이 아닙니다.`);
      socket.emit('chat-fail', `${user.intra_id}의 방장이 아닙니다.`);
      return;
    }
    const ban = chat.banUsers.find(
      (banUser) => banUser.username === user.intra_id,
    );
    if (ban.length === 0) {
      this.logger.log(`fail: ${user.intra_id}는 밴 되어있지 않습니다.`);
      socket.emit('chat-fail', `${user.intra_id}는 밴 되어있지 않습니다.`);
      return;
    }
    await this.banRepository.deleteBanUser(ban.id);
    this.logger.log(`Ban cancle: ${userInfo.intra_id} on ${roomName}`);
    socket.emit('ban-cancle', `${userInfo.intra_id}는 밴 취소되었습니다.`);
  }

  @SubscribeMessage('ban-list')
  async handleBanList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.intra_id) {
      this.logger.log(`fail: ${roomName}의 방장이 아닙니다.`);
      socket.emit('chat-fail', `${roomName}의 방장이 아닙니다.`);
      return;
    }
    this.logger.log(`Ban list of ${roomName} request: ${user.intra_id}`);
    socket.emit('ban-list', { users: chat.users });
  }

  @SubscribeMessage('start-game')
  handleStartGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`${roomName} Game Start`);
    socket.broadcast.to(roomName).emit('start-game');
    return { success: true };
  }

  @SubscribeMessage('move-ball')
  handleMoveBall(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, x, y }: { roomName: string; x: number; y: number },
  ) {
    socket.broadcast.to(roomName).emit('move-ball', { xPos: x, yPos: y });
    return { success: true };
  }

  @SubscribeMessage('mouse-move')
  handleMouseMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, x }: { roomName: string; x: number },
  ) {
    socket.broadcast.to(roomName).emit('mouse-move', { x });
    return { success: true };
  }

  @SubscribeMessage('normal-game-over')
  handleNormalGameOver(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, winner }: { roomName: string; winner: string },
  ) {
    socket.broadcast.to(roomName).emit('normal-game-over', { winner });
    return { success: true };
  }
}
