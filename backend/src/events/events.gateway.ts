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
import { IUserRepository } from 'src/user/repository/users.interface.repository';
import {
  ChatRoomPayload,
  MessagePayload,
  userGamePayload,
} from './events.payload';

let chatRooms: ChatRoomPayload[] = [];

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
  ) {}

  @WebSocketServer() nsp: Namespace;

  afterInit() {
    this.nsp.adapter.on('delete-room', (room) => {
      const deleteChatRoom = chatRooms.find((chatRoom) => chatRoom === room);
      if (!deleteChatRoom) return;
      this.nsp.emit('delete-room', deleteChatRoom);
      chatRooms = chatRooms.filter((chatRoom) => chatRoom !== deleteChatRoom);
    });

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
    @MessageBody() { roomName, userName, message }: MessagePayload,
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
    if (this.nsp.adapter.rooms.has(roomName))
      return { success: false, payload: `${roomName} 방이 이미 존재합니다.` };
    this.nsp.adapter.rooms.set(roomName, new Set());
    this.logger.log(`game ${roomName} is created`);
    this.nsp.emit('create-room', roomName);
    return { success: true, payload: roomName };
  }

  @SubscribeMessage('join-game')
  async handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, type }: userGamePayload,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`${user.intra_id} join game ${roomName} as ${type}`);
    socket.join(roomName);
    socket.broadcast.to(roomName).emit('join-game', {
      message: `${user.intra_id}가 들어왔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
      type: type,
    });
    return { success: true };
  }

  @SubscribeMessage('leave-game')
  async handleLeaveGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, type }: userGamePayload,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`${user.intra_id} leave game ${roomName} as ${type}`);
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit('leave-game', {
      message: `${user.intra_id}가 나갔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
      type: type,
    });
    return { success: true };
  }

  @SubscribeMessage('create-chat')
  async handleCreateChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    const exists = chatRooms.find((room) => room.roomName === roomName);
    if (exists)
      return { success: false, payload: `${roomName} 방이 이미 존재합니다.` };
    socket.join(roomName);
    chatRooms.push({
      roomName: roomName,
      operator: this.userRepository.userToUserDto(user),
      joinUsers: [],
      banList: [],
    });
    this.logger.log(`chat ${roomName} is created`);
    this.nsp.emit('create-room', roomName);
    return { success: true, payload: roomName };
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`${user.intra_id} join chat ${roomName}`);
    const chat = chatRooms.find((chatRoom) => chatRoom.roomName === roomName);
    const isBanned = chat.banList.find((ban) => ban === user.intra_id);
    if (isBanned) return { success: false };
    chat.joinUsers.push(user);
    socket.join(roomName);
    socket.broadcast.to(roomName).emit('join-chat', {
      message: `${user.intra_id}가 들어왔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
    });
    return { success: true };
  }

  @SubscribeMessage('leave-chat')
  async handleLeaveChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`${user.intra_id} leave chat ${roomName}`);
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit('leave-chat', {
      message: `${user.intra_id}가 나갔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
    });
    return { success: true };
  }

  @SubscribeMessage('kick-user')
  async handleKickUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userName },
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`${user.intra_id} is kicked from ${roomName}`);
    const kicked_user = await this.userRepository.findByIntraId(userName);
    const room = await this.nsp.in(roomName).fetchSockets();
    if (room.some((socket) => socket.id === kicked_user.socket_id)) {
      this.nsp.in(roomName).emit('kicked-user', { userName });
      await this.nsp.sockets.get(userName)?.leave(roomName);
    }
  }

  // @SubscribeMessage('ban-user')
  // handleBanUser(
  //   @MessageBody() { roomName, userInfo }: string,
  // ) {
  // const user = await this.userRepository.findBySocketId(socket.id);
  //   this.logger.log(`${userInfo.intra_id} is banned on ${roomName}`);
  // }

  @SubscribeMessage('change-oper')
  async handleChangeOper(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const user = await this.userRepository.findBySocketId(socket.id);
    this.logger.log(`Change operator of ${roomName} as ${user.intra_id}`);
    const chat = chatRooms.find((room) => room.roomName === roomName);
    chat.joinUsers.push(chat.operator);
    chat.joinUsers = chat.joinUsers.filter((user) => user !== user);
    chat.operator = user;
    socket.broadcast.to(roomName).emit('change-oper', {
      message: `${roomName}의 방장이 ${user.intra_id}으로 바뀌었습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
    });
  }

  @SubscribeMessage('chat-list')
  handleChatList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} reqeust chat list`);
    return chatRooms;
  }

  @SubscribeMessage('user-list')
  handleUserList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`${socket.id} request user list of chat ${roomName}`);
    const chat = chatRooms.find((chatRoom) => chatRoom.roomName === roomName);
    return chat.joinUsers;
  }

  @SubscribeMessage('ban-list')
  handleBanList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`${socket.id} request ban list of chat ${roomName}`);
    const chat = chatRooms.find((chatRoom) => chatRoom.roomName === roomName);
    return chat.banList;
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
