import { Logger } from '@nestjs/common';
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

interface userPayload {
  roomName: string;
  userInfo: UserDto;
}

interface userGamePayload {
  roomName: string;
  userInfo: UserDto;
  type: string;
}

interface MessagePayload {
  roomName: string;
  userName: string;
  message: string;
}

interface ChatRoomPayload {
  roomName: string;
  joinUsers: UserDto[];
}

let gameRooms: string[] = [];
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

  @WebSocketServer() nsp: Namespace;

  afterInit() {
    this.nsp.adapter.on('delete-room', (room) => {
      const deleteGameRoom = gameRooms.find((gameRoom) => gameRoom === room);
      if (!deleteGameRoom) return;
      this.nsp.emit('delete-room', deleteGameRoom);
      gameRooms = gameRooms.filter((gameRoom) => gameRoom !== deleteGameRoom);

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
    const exists = gameRooms.find((createdRoom) => createdRoom === roomName);
    if (exists)
      return { success: false, payload: `${roomName} 방이 이미 존재합니다.` };
    socket.join(roomName);
    gameRooms.push(roomName);
    this.logger.log(`game ${roomName} is created`);
    this.nsp.emit('create-room', roomName);
    return { success: true, payload: roomName };
  }

  @SubscribeMessage('join-game')
  handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userInfo, type }: userGamePayload,
  ) {
    this.logger.log(`${userInfo.intra_id} join game ${roomName} as ${type}`);
    socket.join(roomName);
    socket.broadcast.to(roomName).emit('join-room', {
      message: `${userInfo.intra_id}가 들어왔습니다.`,
      userInfo: userInfo,
      type: type,
    });
    return { success: true };
  }

  @SubscribeMessage('leave-game')
  handleLeaveGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userInfo, type }: userGamePayload,
  ) {
    this.logger.log(`${userInfo.intra_id} leave game ${roomName} as ${type}`);
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit('leave-room', {
      message: `${userInfo.intra_id}가 나갔습니다.`,
      userInfo: userInfo,
      type: type,
    });
    return { success: true };
  }

  @SubscribeMessage('create-chat')
  handleCreateChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userInfo }: userPayload,
  ) {
    const exists = chatRooms.find(
      (createdRoom) => createdRoom.roomName === roomName,
    );
    if (exists)
      return { success: false, payload: `${roomName} 방이 이미 존재합니다.` };
    socket.join(roomName);
    chatRooms.push({ roomName: roomName, joinUsers: [userInfo] });
    this.logger.log(`chat ${roomName} is created`);
    this.nsp.emit('create-room', roomName);
    return { success: true, payload: roomName };
  }

  @SubscribeMessage('join-chat')
  handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userInfo }: userPayload,
  ) {
    this.logger.log(`${userInfo.intra_id} join chat ${roomName}`);
    socket.join(roomName);
    const chat = chatRooms.find((chatRoom) => chatRoom.roomName === roomName);
    chat.joinUsers.push(userInfo);
    socket.broadcast.to(roomName).emit('join-room', {
      message: `${userInfo.intra_id}가 들어왔습니다.`,
      userInfo: userInfo,
    });
    return { success: true };
  }

  @SubscribeMessage('leave-chat')
  handleLeaveChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userInfo }: userPayload,
  ) {
    this.logger.log(`${userInfo.intra_id} leave chat ${roomName}`);
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit('leave-room', {
      message: `${userInfo.intra_id}가 나갔습니다.`,
      userInfo: userInfo,
    });
    return { success: true };
  }

  @SubscribeMessage('start-game')
  handleStartGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName }: userPayload,
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
}
