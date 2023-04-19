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
import { ChatType } from 'src/entity/common.enum';
import { EventsService } from './events.service';

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
  constructor(private eventsService: EventsService) {}

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
    this.eventsService.registUser(intra_id, socket.id);
    socket.broadcast.emit('connect-user', `${intra_id}가 접속했습니다.`);
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
    socket.broadcast.to(roomName).emit('message', { userName, message });
  }

  @SubscribeMessage('create-game')
  async handleCreateGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    if (this.nsp.adapter.rooms.has(roomName)) {
      this.logger.log(`fail: ${roomName} 방이 이미 존재합니다.`);
      return;
    }
    socket.join(roomName);
    this.nsp.emit('create-game', roomName);
    this.logger.log(`${roomName} 생성 완료`);
  }

  @SubscribeMessage('join-game')
  async handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, type }: { roomName: string; type: string },
  ) {
    const user = await this.eventsService.getUserDtoFromSocketId(socket.id);
    socket.join(roomName);
    socket.broadcast.to(roomName).emit('join-game', {
      message: `${user.intra_id}가 들어왔습니다.`,
      userInfo: user,
      type: type,
    });
    this.logger.log(`${user.intra_id}가 ${roomName}에 참가했습니다.`);
  }

  @SubscribeMessage('leave-game')
  async handleLeaveGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, type }: { roomName: string; type: string },
  ) {
    const user = await this.eventsService.getUserDtoFromSocketId(socket.id);
    this.logger.log(`${user.intra_id} leave game ${roomName} as ${type}`);
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit('leave-game', {
      message: `${user.intra_id}가 나갔습니다.`,
      userInfo: user,
      type: type,
    });
  }

  @SubscribeMessage('friend-list')
  async handleFriendList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`친구 목록 조회`);
    const data = await this.eventsService.getFriendList(socket.id);
    socket.emit('friend-list', data);
  }

  @SubscribeMessage('friend-request-list')
  async handleFriendRequestList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`친구 요청 목록 조회`);
    const data = await this.eventsService.getFriendRequestList(socket.id);
    socket.emit('friend-request-list', data);
  }

  @SubscribeMessage('request-friend')
  async handleFriendRequest(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    const result = await this.eventsService.friendRequest(
      socket.id,
      friendName,
    );
    if (result.success) {
      const user = result.data.user;
      const friend = result.data.friend;
      socket.emit('request-friend', {
        username: friendName,
        profile: friend.profile,
      });
      socket
        .to(friend.socket_id)
        .emit('new-friend', { username: user.intra_id, profile: user.profile });
    } else {
      socket.emit('friend-fail', result.msg);
    }
    this.logger.log(result.msg);
  }

  @SubscribeMessage('response-friend')
  async handleAcceptFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { friendName, type }: { friendName: string; type: boolean },
  ) {
    const result = await this.eventsService.friendResponse(
      socket.id,
      friendName,
      type,
    );
    if (result.success) {
      socket.emit('response-friend', { friendName, type });
      this.nsp.sockets
        .get(result.data)
        ?.emit('friend-result', { friendName, type });
    } else {
      socket.emit('friend-fail', result.msg);
    }
    this.logger.log(result.msg);
  }

  @SubscribeMessage('cancel-friend')
  async handleCancelFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    const result = await this.eventsService.cancelFriend(socket.id, friendName);
    if (result.success) {
      socket.emit('cancel-friend', { userName: friendName });
      this.nsp.sockets
        .get(result.data)
        ?.emit('cancel-friend', { userName: result.username });
    } else {
      socket.emit('friend-fail', result.msg);
    }
    this.logger.log(`${result.username} -> ${friendName} 친구 요청 취소`);
  }

  @SubscribeMessage('delete-friend')
  async handleDeleteFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    const result = await this.eventsService.deleteFriend(socket.id, friendName);
    if (result.success) {
      socket.emit('delete-friend', { userName: friendName });
      this.nsp.sockets
        .get(result.data)
        ?.emit('delete-friend', { userName: result.username });
    } else {
      socket.emit('friend-fail', result.msg);
    }
    this.logger.log(`${result.username} <-> ${friendName} 친구 삭제`);
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
    const result = await this.eventsService.creatChat(
      socket.id,
      roomName,
      type,
      password,
    );
    if (result.success) {
      socket.join(roomName);
      this.nsp.emit('create-chat', { roomName, type, operator: result.data });
      socket.emit('create-success', { roomName, type, operator: result.data });
    } else {
      socket.emit('chat-fail', result.msg);
    }
    this.logger.log(result.msg);
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomName,
      password,
    }: { roomName: string; password: string; type: number; operator: string },
  ) {
    const result = await this.eventsService.joinChat(
      socket.id,
      roomName,
      password,
    );
    if (result.success) {
      socket.join(roomName);
      socket.broadcast.emit('join-chat', {
        message: result.msg,
        username: result.joinuser,
        roomName,
      });
      socket.emit('join-chat-success', result.data);
    } else {
      socket.emit('chat-fail', result.msg);
    }
    this.logger.log(result.msg);
  }

  @SubscribeMessage('leave-chat')
  async handleLeaveChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const result = await this.eventsService.leaveChat(socket.id, roomName);
    console.log(result);
    if (result.success) {
      socket.leave(roomName);
      socket.broadcast.emit('leave-chat', {
        message: result.msg,
        username: result.data,
        roomName: roomName,
      });
      socket.emit('leave-chat-success', roomName);
    } else {
      socket.emit('chat-fail', result.msg);
    }
    this.logger.log(result.msg);
  }

  @SubscribeMessage('all-chat')
  async handleAllChatList(@ConnectedSocket() socket: Socket) {
    const data = await this.eventsService.getAllChatList(socket.id);
    this.logger.log(`All chat request: ${data.user}`);
    socket.emit('all-chat', { chats: data.chats });
  }

  @SubscribeMessage('chat-list')
  async handleChatList(@ConnectedSocket() socket: Socket) {
    const data = await this.eventsService.getChatList(socket.id);
    this.logger.log(`Chat list request: ${data.user}`);
    socket.emit('chat-list', { chats: data.chats });
  }

  @SubscribeMessage('user-list')
  async handleUserList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const data = await this.eventsService.getUserList(socket.id, roomName);
    this.logger.log(`Users of ${roomName} request: ${data.user}`);
    socket.emit('user-list', { users: data.users });
  }

  @SubscribeMessage('kick-user')
  async handleKickUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, userName },
  ) {
    const result = await this.eventsService.kickUser(
      socket.id,
      roomName,
      userName,
    );
    if (result.success) {
      const room = await this.nsp.in(roomName).fetchSockets();
      if (room.some((socket) => socket.id === result.data)) {
        this.nsp.in(roomName).emit('kick-user', { roomName, userName });
        await this.nsp.sockets.get(result.data)?.leave(roomName);
      }
    } else {
      socket.emit('chat-fail', result.msg);
    }
    this.logger.log(result.msg);
  }

  @SubscribeMessage('mute-user')
  async handleMute(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    const result = await this.eventsService.muteUser(
      socket.id,
      roomName,
      userName,
    );
    if (result.success) {
      socket.emit('mute-user', { roomName: roomName, username: userName });
      this.nsp.sockets.get(result.data).emit('chat-muted', roomName);
    }
  }

  @SubscribeMessage('chat-password')
  async handleChatChangePassword(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, password }: { roomName: string; password: string },
  ) {
    const result = await this.eventsService.changePassword(
      socket.id,
      roomName,
      password,
    );
    if (result.success) socket.emit('chat-password', result.msg);
    else socket.emit('chat-fail', result.msg);
    this.logger.log(result.msg);
  }

  @SubscribeMessage('chat-operator')
  async handleChatChangeOperator(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, operator }: { roomName: string; operator: string },
  ) {
    const result = await this.eventsService.changeOperator(
      socket.id,
      roomName,
      operator,
    );
    if (result.success)
      this.nsp.to(roomName).emit('chat-operator', result.data);
    else socket.emit('chat-fail', result.msg);
    this.logger.log(result.msg);
  }

  @SubscribeMessage('ban-user')
  async handleBanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    const banResult = await this.eventsService.banUser(
      socket.id,
      roomName,
      userName,
    );
    let message = banResult.msg;
    if (banResult.success) {
      const kickResult = await this.eventsService.kickUser(
        socket.id,
        roomName,
        userName,
      );
      if (kickResult.success) {
        const room = await this.nsp.in(roomName).fetchSockets();
        if (room.some((socket) => socket.id === kickResult.data)) {
          this.nsp.in(roomName).emit('ban-user', { roomName, userName });
          await this.nsp.sockets.get(kickResult.data)?.leave(roomName);
        }
      } else {
        socket.emit('chat-fail', kickResult.msg);
        message = kickResult.msg;
      }
    } else socket.emit('chat-fail', banResult.msg);
    this.logger.log(message);
  }

  @SubscribeMessage('ban-cancel')
  async handleCancelUserBan(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userInfo }: { roomName: string; userInfo: UserDto },
  ) {
    const result = await this.eventsService.cancelBan(
      socket.id,
      roomName,
      userInfo.intra_id,
    );
    if (result.success) socket.emit('ban-cancel', result.msg);
    else socket.emit('chat-fail', result.msg);
    this.logger.log(result.msg);
  }

  @SubscribeMessage('ban-list')
  async handleBanList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const result = await this.eventsService.getBanList(socket.id, roomName);
    if (result.success) socket.emit('ban-list', result.data);
    else socket.emit('chat-fail', result.msg);
    this.logger.log(result.msg);
  }

  @SubscribeMessage('start-game')
  async handleStartGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`${roomName} Game Start`);
    socket.broadcast.to(roomName).emit('start-game');
    const result = await this.eventsService.gameAlert(
      roomName,
      '가 게임 중입니다.',
    );
    result.forEach((data) => {
      socket.broadcast.emit('user-ingame', data);
    });
  }

  @SubscribeMessage('obstacle-info')
  handleObstacleInfo(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, obstaclePos }: { roomName: string; obstaclePos: number[] },
  ) {
    socket.broadcast.to(roomName).emit('obstacle-info', obstaclePos);
  }

  @SubscribeMessage('move-ball')
  handleMoveBall(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, x, y }: { roomName: string; x: number; y: number },
  ) {
    socket.broadcast.to(roomName).emit('move-ball', { xPos: x, yPos: y });
  }

  @SubscribeMessage('mouse-move')
  handleMouseMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, x }: { roomName: string; x: number },
  ) {
    socket.broadcast.to(roomName).emit('mouse-move', { x });
  }

  @SubscribeMessage('normal-game-over')
  async handleNormalGameOver(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, winner }: { roomName: string; winner: string },
  ) {
    socket.broadcast.to(roomName).emit('normal-game-over', { winner });
    const result = await this.eventsService.gameAlert(
      roomName,
      '의 게임이 끝났습니다.',
    );
    result.forEach((data) => {
      socket.broadcast.emit('user-ingame', data);
    });
  }
}
