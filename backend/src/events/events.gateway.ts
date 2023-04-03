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

interface MessagePayload {
  roomName: string;
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
    this.nsp.adapter.on('DeleteRoom', (room) => {
      const deletedRoom = createdRooms.find(
        (createdRoom) => createdRoom === room,
      );
      if (!deletedRoom) return;

      this.nsp.emit('DeleteRoom', deletedRoom);
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
    @MessageBody() { roomName, message }: MessagePayload,
  ) {
    socket.broadcast
      .to(roomName)
      .emit('message', { username: socket.id, message });

    return { username: socket.id, message };
  }

  @SubscribeMessage('RoomList')
  handleRoomList() {
    return createdRooms;
  }

  @SubscribeMessage('CreateRoom')
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const exists = createdRooms.find((createdRoom) => createdRoom === roomName);
    if (exists)
      return { success: false, payload: `${roomName} 방이 이미 존재합니다.` };
    socket.join(roomName);
    createdRooms.push(roomName);
    this.nsp.emit('CreateRoom', roomName);
    return { success: true, payload: roomName };
  }

  @SubscribeMessage('JoinRoom')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    socket.join(roomName);
    socket.broadcast
      .to(roomName)
      .emit('message', { message: `${socket.id}가 들어왔습니다.` });
    return { success: true };
  }

  @SubscribeMessage('LeaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    socket.leave(roomName);
    socket.broadcast
      .to(roomName)
      .emit('message', { message: `${socket.id}가 나갔습니다.` });
    return { success: true };
  }
}
