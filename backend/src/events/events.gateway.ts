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

interface MessagePayload {
  roomName: string;
  userName: string;
  message: string;
}

let createdRooms: string[] = [];

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
      const deletedRoom = createdRooms.find(
        (createdRoom) => createdRoom === room,
      );
      if (!deletedRoom) return;

      this.nsp.emit('delete-room', deletedRoom);
      createdRooms = createdRooms.filter(
        (createdRoom) => createdRoom !== deletedRoom,
      );
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
    this.logger.log(roomName, message);
    socket.broadcast
      .to(roomName)
      .emit('message', { username: userName, message });

    return { username: socket.id, message };
  }

  @SubscribeMessage('room-list')
  handleRoomList() {
    return createdRooms;
  }

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const exists = createdRooms.find((createdRoom) => createdRoom === roomName);
    if (exists)
      return { success: false, payload: `${roomName} 방이 이미 존재합니다.` };
    socket.join(roomName);
    createdRooms.push(roomName);
    this.logger.log(`socket create room: ${roomName}`);
    this.nsp.emit('create-room', roomName);
    return { success: true, payload: roomName };
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userInfo }: userPayload,
  ) {
    this.logger.log(`socket join room: ${roomName} / ${userInfo.intra_id}`);
    socket.join(roomName);
    socket.broadcast.to(roomName).emit('join-room', {
      message: `${userInfo.intra_id}가 들어왔습니다.`,
      userInfo: userInfo,
    });
    return { success: true };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userInfo }: userPayload,
  ) {
    this.logger.log(`socket leave room: ${roomName} / ${userInfo.intra_id}`);
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit('leave-room', {
      message: `${userInfo.intra_id}가 나갔습니다.`,
      userInfo: userInfo,
    });
    return { success: true };
  }
}
