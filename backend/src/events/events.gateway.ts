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
import { FriendService } from 'src/friend/friend.service';
import { CreateChatPayload, MessagePayload } from './events.payload';
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
  private muteQueue = [];
  constructor(
    private eventsService: EventsService,
    private friendService: FriendService,
  ) {}

  @WebSocketServer() nsp: Namespace;

  afterInit() {
    this.logger.log('AfterInit');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[Connection] socketId: ${socket.id}`);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[Disconnect] socketId: ${socket.id}`);
    await this.eventsService.disconnect(socket.id);
  }

  @SubscribeMessage('first-connection')
  async handleSocketConnect(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[SocketConnect] socketId: ${socket.id}`);
    await this.eventsService.registUser(userName, socket.id);
    socket.emit('first-connection');
    socket.broadcast.emit('connect-user', {
      userName,
      message: `${userName}가 접속했습니다.`,
    });
  }

  @SubscribeMessage('check-connection')
  async handleCheckConnect(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[CheckConnect] userName: ${userName}`);
    const isConnect = await this.eventsService.isConnect(userName);
    socket.emit('check-connection', { userName, isConnect });
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName, message }: MessagePayload,
  ) {
    this.logger.log(
      `Message`,
      `roomName: ${roomName},`,
      `userName: ${userName},`,
      `message: ${message}`,
    );
    let flag = true;
    let leftTime = 0;
    this.muteQueue.forEach(([targetRoom, targetName, targetTime]) => {
      const now = new Date();
      leftTime = Math.floor((now.getTime() - targetTime.getTime()) / 1000);
      if (targetRoom === roomName && targetName === userName) flag = false;
    });
    if (flag) {
      socket.broadcast
        .to(roomName)
        .emit('message', { userName, roomName, message });
    } else {
      socket.emit('chat-fail', `${leftTime} 후 음소거가 풀립니다.`);
    }
  }

  @SubscribeMessage('create-game')
  handleCreateGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`[CreateGame] roomName: ${roomName}`);
    if (this.nsp.adapter.rooms.has(roomName)) {
      return;
    }
    socket.join(roomName);
    this.nsp.emit('create-game', roomName);
    this.logger.log(`게임 ${roomName} 생성 성공`);
  }

  @SubscribeMessage('join-game')
  async handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, type }: { roomName: string; type: string },
  ) {
    this.logger.log(`[JoinGame] roomName: ${roomName}, type: ${type}`);
    const user = await this.eventsService.getUserDtoFromSocketId(socket.id);
    socket.join(roomName);
    socket.broadcast.to(roomName).emit('join-game', {
      message: `${user.userName}가 들어왔습니다.`,
      userInfo: user,
      type: type,
    });
  }

  @SubscribeMessage('leave-game')
  async handleLeaveGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, type }: { roomName: string; type: string },
  ) {
    this.logger.log(`[LeaveGame] roomName: ${roomName}, type: ${type}`);
    const user = await this.eventsService.getUserDtoFromSocketId(socket.id);
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit('leave-game', {
      message: `${user.userName}가 나갔습니다.`,
      userInfo: user,
      type: type,
    });
  }

  @SubscribeMessage('friend-list')
  async handleFriendList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[FriendList]`);
    const friends = await this.friendService.getFriendList(socket.id);
    socket.emit('friend-list', friends);
  }

  @SubscribeMessage('friend-request-list')
  async handleFriendRequestList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[FriendRequestList]`);
    const requests = await this.friendService.getFriendRequestList(socket.id);
    socket.emit('friend-request-list', requests);
  }

  @SubscribeMessage('request-friend')
  async handleFriendRequest(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    this.logger.log(`[FriendRequest] friendName: ${friendName}`);
    const result = await this.friendService.friendRequest(
      socket.id,
      friendName,
    );
    if (result.success) {
      const user = result.data.user;
      const friend = result.data.friend;
      socket.emit('request-friend', {
        userName: friendName,
        profile: friend.profile,
      });
      socket
        .to(friend.socketId)
        .emit('new-friend', { userName: user.userName, profile: user.profile });
    } else {
      socket.emit('friend-fail', result.msg);
    }
  }

  @SubscribeMessage('response-friend')
  async handleAcceptFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { friendName, type }: { friendName: string; type: boolean },
  ) {
    this.logger.log(`[AcceptFriend] friendName: ${friendName}, type: ${type}`);
    const result = await this.friendService.friendResponse(
      socket.id,
      friendName,
      type,
    );
    if (result.success) {
      socket.emit('response-friend', result.sender);
      this.nsp.sockets.get(result.data)?.emit('friend-result', result.receiver);
    } else {
      socket.emit('friend-fail', result.msg);
    }
  }

  @SubscribeMessage('cancel-friend')
  async handleCancelFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    this.logger.log(`[CancelFriend] friendName: ${friendName}`);
    const result = await this.friendService.cancelFriend(socket.id, friendName);
    if (result.success) {
      socket.emit('cancel-friend', { userName: friendName });
      this.nsp.sockets
        .get(result.data)
        ?.emit('cancel-friend', { userName: result.userName });
    } else {
      socket.emit('friend-fail', result.msg);
    }
  }

  @SubscribeMessage('delete-friend')
  async handleDeleteFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    this.logger.log(`DeleteFriend / friendName: ${friendName}`);
    const result = await this.friendService.deleteFriend(socket.id, friendName);
    if (result.success) {
      socket.emit('delete-friend', { userName: friendName });
      this.nsp.sockets
        .get(result.data)
        ?.emit('delete-friend', { userName: result.userName });
    } else {
      socket.emit('friend-fail', result.msg);
    }
  }

  @SubscribeMessage('send-dm')
  async handleDirectMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[DirectMessage] userName: ${userName}`);
    const result = await this.eventsService.directMessage(socket.id, userName);
    if (result.success) {
      socket.emit('send-dm', {
        title: result.title,
        userName: result.receiverName,
      });
      socket.join(result.title);
      this.nsp.sockets.get(result.receiverSocket)?.emit('receive-dm', {
        title: result.title,
        userName: result.senderName,
      });
      this.nsp.sockets.get(result.receiverSocket)?.join(result.title);
    } else {
      socket.emit('chat-fail', result.msg);
    }
  }

  @SubscribeMessage('create-chat')
  async handleCreateChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, type, password }: CreateChatPayload,
  ) {
    this.logger.log(
      `[CreateChat] roomName: ${roomName}, type: ${type}, password: ${password}`,
    );
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
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, password }: { roomName: string; password: string },
  ) {
    this.logger.log(`[JoinChat] roomName: ${roomName}, password: ${password}`);
    const result = await this.eventsService.joinChat(
      socket.id,
      roomName,
      password,
    );
    if (result.success) {
      socket.join(roomName);
      socket.broadcast.emit('join-chat', {
        message: result.msg,
        userName: result.joinuser,
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
    this.logger.log(`[LeaveChat] roomName: ${roomName}`);
    const result = await this.eventsService.leaveChat(socket.id, roomName);
    if (result.success) {
      socket.leave(roomName);
      socket.broadcast.emit('leave-chat', {
        message: result.msg,
        userName: result.data,
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
    this.logger.log(`[AllChatList]`);
    const data = await this.eventsService.getAllChatList(socket.id);
    socket.emit('all-chat', { chats: data.chats });
  }

  @SubscribeMessage('chat-list')
  async handleChatList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[ChatList]`);
    const data = await this.eventsService.getChatList(socket.id);
    socket.emit('chat-list', { chats: data.chats });
  }

  @SubscribeMessage('user-list')
  async handleUserList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`[UserList] roomName: ${roomName}`);
    const data = await this.eventsService.getUserList(socket.id, roomName);
    socket.emit('user-list', { users: data.users });
  }

  @SubscribeMessage('kick-user')
  async handleKickUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    this.logger.log(`[KickUser] roomName: ${roomName}, userName: ${userName}`);
    const result = await this.eventsService.kickUser(
      socket.id,
      roomName,
      userName,
    );
    if (result.success) {
      const room = await this.nsp.in(roomName).fetchSockets();
      this.nsp.emit('kick-user', { roomName, userName });
      await this.nsp.sockets.get(result.data)?.leave(roomName);
    } else {
      socket.emit('chat-fail', result.msg);
    }
  }

  @SubscribeMessage('mute-user')
  async handleMuteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    this.logger.log(`[MuteUser] roomName: ${roomName}, userName: ${userName}`);
    const result = await this.eventsService.muteUser(
      socket.id,
      roomName,
      userName,
    );
    if (result.success) {
      socket.emit('mute-user', { roomName, userName });
      this.muteQueue.push([roomName, userName, new Date()]);
      setTimeout(() => {
        this.muteQueue.shift();
      }, 30000);
      console.log(this.muteQueue);
      this.nsp.sockets.get(result.data)?.emit('chat-muted', roomName);
    } else {
      socket.emit('chat-fail', result.msg);
    }
  }

  @SubscribeMessage('chat-password')
  async handleChatChangePassword(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, password }: { roomName: string; password: string },
  ) {
    this.logger.log(
      `[ChatChangePassword] roomName: ${roomName}, password: ${password}`,
    );
    const result = await this.eventsService.changePassword(
      socket.id,
      roomName,
      password,
    );
    if (result.success) socket.emit('chat-password', result.msg);
    else socket.emit('chat-fail', result.msg);
  }

  @SubscribeMessage('chat-operator')
  async handleChatChangeOperator(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, operator }: { roomName: string; operator: string },
  ) {
    this.logger.log(
      `[ChatChangeOperator] roomName: ${roomName}, operator: ${operator}`,
    );
    const result = await this.eventsService.changeOperator(
      socket.id,
      roomName,
      operator,
    );
    if (result.success)
      this.nsp.to(roomName).emit('chat-operator', result.data);
    else socket.emit('chat-fail', result.msg);
  }

  @SubscribeMessage('ban-user')
  async handleBanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    this.logger.log(`[BanUser] roomName: ${roomName}, userName: ${userName}`);
    const banResult = await this.eventsService.banUser(
      socket.id,
      roomName,
      userName,
    );
    if (banResult.success) {
      const kickResult = await this.eventsService.kickUser(
        socket.id,
        roomName,
        userName,
      );
      if (kickResult.success) {
        this.nsp.emit('ban-user', { roomName, userName });
        await this.nsp.sockets.get(kickResult.data)?.leave(roomName);
      } else {
        socket.emit('chat-fail', kickResult.msg);
      }
    } else socket.emit('chat-fail', banResult.msg);
  }

  @SubscribeMessage('ban-cancel')
  async handleBanCancel(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    this.logger.log(`[BanCancel] roomName: ${roomName}, userName: ${userName}`);
    const result = await this.eventsService.banCancel(
      socket.id,
      roomName,
      userName,
    );
    if (result.success) socket.emit('ban-cancel', { roomName, userName });
    else socket.emit('chat-fail', result.msg);
  }

  @SubscribeMessage('ban-list')
  async handleBanList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`[BanList] roomName: ${roomName}`);
    const result = await this.eventsService.getBanList(socket.id, roomName);
    if (result.success) socket.emit('ban-list', result.data);
    else socket.emit('chat-fail', result.msg);
  }

  @SubscribeMessage('block-list')
  async handleBlockList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[BlockList]`);
    const result = await this.eventsService.getBlockList(socket.id);
    socket.emit('block-list', result);
  }

  @SubscribeMessage('block-user')
  async handleBlockUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[BlockUser] userName: ${userName}`);
    const result = await this.eventsService.blockUser(socket.id, userName);
    if (result.success) socket.emit('block-user', userName);
    else socket.emit('chat-fail', result.msg);
    this.logger.log(result.msg);
  }

  @SubscribeMessage('block-cancel')
  async handleBlockCancel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[BlockCancel] userName: ${userName}`);
    const result = await this.eventsService.blockCancel(socket.id, userName);
    if (result.success) socket.emit('block-cancel', userName);
    else socket.emit('chat-fail', result.msg);
    this.logger.log(result.msg);
  }

  @SubscribeMessage('start-game')
  async handleStartGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`[StartGame] roomName: ${roomName}`);
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
  async handleGameOver(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, winner }: { roomName: string; winner: string },
  ) {
    this.logger.log(`[GameOver] roomName: ${roomName}, winner: ${winner}`);
    socket.broadcast.to(roomName).emit('normal-game-over', { winner });
    const result = await this.eventsService.gameAlert(
      roomName,
      '의 게임이 끝났습니다.',
    );
    result.forEach((data) => {
      socket.broadcast.emit('user-gameout', data);
    });
  }
}
