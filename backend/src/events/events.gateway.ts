import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GameDto } from 'src/dto/game.dto';
import { GameType, JoinType } from 'src/entity/common.enum';
import { GameService } from 'src/game/game.service';
import {
  CreateChatPayload,
  GameResultPayload,
  MessagePayload,
} from './events.payload';
import { EventsService } from './events.service';

@WebSocketGateway({
  namespace: 'GameChat',
  cors: {
    origin: ['http://localhost:5173'],
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(EventsGateway.name);
  private sessionMap = {};
  constructor(
    private eventsService: EventsService,
    private gameService: GameService,
  ) {}

  @WebSocketServer() nsp: Namespace;

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[Connection] socketId: ${socket.id}`);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[Disconnect] socketId: ${socket.id}`);
    this.eventsService.cancelRankGame(socket.id);
    const data = await this.eventsService.getSocketInfo(socket.id);
    if (!data) return;
    const timeId = setTimeout(async () => {
      this.nsp.emit('disconnect-user', {
        userName: data.userName,
        message: `${data.userName}가 접속을 해제했습니다.`,
      });
      data.chatRooms.forEach((room) => {
        this.handleLeaveChat(socket, room);
      });
      data.gameRooms.forEach((room) => {
        this.handleLeaveGame(socket, room);
      });
      delete this.sessionMap[data.userName];
    }, 1000);
    this.sessionMap[data.userName] = timeId;
  }

  @SubscribeMessage('first-connection')
  async handleSocketConnect(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[SocketConnect] socketId: ${socket.id}`);
    const rooms = await this.eventsService.registUser(userName, socket.id);
    if (this.sessionMap[userName]) {
      const timeId = this.sessionMap[userName];
      clearTimeout(timeId);
      delete this.sessionMap[userName];
      rooms.forEach((room) => {
        socket.join(room);
      });
    } else {
      socket.emit('first-connection');
      socket.broadcast.emit('connect-user', {
        userName,
        message: `${userName}가 접속했습니다.`,
      });
    }
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
  async handleMessage(
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
    const check = this.eventsService.checkMuteQueue(roomName, userName);
    if (check.flag) {
      socket.broadcast
        .to(roomName)
        .emit('message', { userName, roomName, message });
    } else {
      socket.emit('chat-fail', `${check.leftTime} 후 음소거가 풀립니다.`);
    }
  }

  @SubscribeMessage('user-name')
  async handleChangeUserName(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[ChangeUserName] userName: ${userName}`);
    try {
      const result = await this.eventsService.changeUserName(
        socket.id,
        userName,
      );
      this.nsp.emit('user-name', result);
    } catch (err) {
      socket.emit('user-fail', err.message);
    }
  }

  @SubscribeMessage('user-profile')
  async handleChangeUserProfile(
    @ConnectedSocket() socket: Socket,
    @MessageBody() image: Buffer,
  ) {
    this.logger.log(`[ChangeProfile] image: ${socket.id}`);
    const result = await this.eventsService.changeUserProfile(socket.id, image);
    try {
      this.nsp.emit('user-profile', result);
    } catch (err) {
      socket.emit('user-fail', err.message);
    }
  }

  @SubscribeMessage('game-list')
  async handleGameList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[GameList]`);
    let games = await this.gameService.getLobbyInfo();
    socket.emit('game-list', games);
  }

  @SubscribeMessage('create-game')
  async handleCreateGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, gameDto }: { roomName: string; gameDto: GameDto },
  ) {
    this.logger.log(`[CreateGame] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.createGame(gameDto, socket.id);
      socket.join(roomName);
      socket.emit('create-game', result);
      socket.broadcast.emit('new-game', result.gameDto);
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('join-game')
  async handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, password }: { roomName: string; password: string },
  ) {
    this.logger.log(`[JoinGame] roomName: ${roomName}, password: ${password}`);
    try {
      const result = await this.eventsService.joinGame(
        roomName,
        password,
        socket.id,
      );
      socket.join(roomName);
      socket.emit('join-game', result.data);
      socket.broadcast.emit('user-join-game', {
        message: `${result.user.userName}가 들어왔습니다.`,
        userInfo: result.user,
        roomName,
        type: JoinType.PLAYER,
      });
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('watch-game')
  async handleWatchGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, password }: { roomName: string; password: string },
  ) {
    this.logger.log(`[WatchGame] roomName: ${roomName}, password: ${password}`);
    try {
      const result = await this.eventsService.watchGame(
        roomName,
        password,
        socket.id,
      );
      socket.join(roomName);
      socket.emit('watch-game', result.data);
      socket.broadcast.emit('user-watch-game', {
        message: `${result.user.userName}가 들어왔습니다.`,
        userInfo: result.user,
        roomName,
        type: JoinType.WATCHER,
      });
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('leave-game')
  async handleLeaveGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`[LeaveGame] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.leaveGame(socket.id);
      socket.leave(roomName);
      socket.emit('leave-game', `${roomName}에서 나왔습니다.`);
      socket.broadcast.emit('user-leave-game', {
        message: `${result.user.userName}가 나갔습니다.`,
        userInfo: result.user,
        roomName,
        type: result.type,
      });
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('refresh-while-playing')
  async handleRefreshOnPlaying(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomName,
      userName,
      type,
    }: { roomName: string; userName: string; type: GameType },
  ) {
    this.logger.log(
      `[RefreshOnPlaying] roomName: ${roomName}, userName: ${userName},`,
      'type: ' + (type === GameType.NORMAL) ? 'NORMAL' : 'RANK',
    );
    try {
      await this.eventsService.loseGameAsAction(roomName, userName, type);
      socket
        .to(roomName)
        .emit('refresh-while-playing', { roomName, userName, type });
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('leave-while-playing')
  async handleLeaveOnPlaying(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomName,
      userName,
      type,
    }: { roomName: string; userName: string; type: GameType },
  ) {
    this.logger.log(
      `[LeaveOnPlaying] roomName: ${roomName}, userName: ${userName},`,
      'type: ' + (type === GameType.NORMAL) ? 'NORMAL' : 'RANK',
    );
    try {
      await this.eventsService.loseGameAsAction(roomName, userName, type);
      socket.to(roomName).emit('leave-while-playing', { roomName, userName });
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('game-invite')
  async handleGameInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    this.logger.log(`[InviteGame] roomName: ${roomName} userName: ${userName}`);
    try {
      const result = await this.eventsService.gameInvite(
        socket.id,
        userName,
        roomName,
      );
      this.nsp.sockets.get(result.invitedSocektId)?.emit('game-invite', {
        roomName,
        userName: result.invitorUserName,
      });
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('game-accept')
  async handleGameAccept(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`[AcceptGame] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.gameAccept(socket.id, roomName);
      const joinResult = await this.eventsService.joinGame(
        roomName,
        result.password,
        socket.id,
      );
      socket.join(roomName);
      socket.emit('join-game', joinResult.data);
      socket.broadcast.emit('user-join-game', {
        message: `${joinResult.user.userName}가 들어왔습니다.`,
        userInfo: joinResult.user,
        roomName,
        type: JoinType.PLAYER,
      });
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('game-reject')
  async handleGameReject(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { userName, roomName }: { userName: string; roomName: string },
  ) {
    this.logger.log(`[AcceptGame] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.gameInviteInfo(
        socket.id,
        userName,
        roomName,
      );
      socket.emit('game-reject', { roomName, userName: result.userName });
      this.nsp.sockets
        .get(result.socket)
        ?.emit('game-reject', { roomName, userName: result.userName });
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('game-cancel-invite')
  async handleGameCancelInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { userName, roomName }: { userName: string; roomName: string },
  ) {
    this.logger.log(`[AcceptGame] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.gameInviteInfo(
        socket.id,
        userName,
        roomName,
      );
      socket.emit('game-cancel-invite', { roomName, userName });
      this.nsp.sockets
        .get(result.socket)
        ?.emit('game-cancel-invite', { roomName, userName: result.userName });
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('match-rank')
  async handleMatchRank(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[MatchRank]`);
    const data = await this.eventsService.matchRankGame(socket.id);
    if (data) {
      socket.join(data.roomName);
      socket.emit('match-rank', {
        roomName: data.roomName,
        ownerDto: data.owner,
        opponentDto: data.opponent,
      });
      this.nsp.sockets.get(data.socketId)?.join(data.roomName);
      this.nsp.sockets.get(data.socketId)?.emit('match-rank', {
        roomName: data.roomName,
        ownerDto: data.owner,
        opponentDto: data.opponent,
      });
    }
  }

  @SubscribeMessage('cancel-rank')
  handleCancelRank(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[CancelRank]`);
    this.eventsService.cancelRankGame(socket.id);
  }

  @SubscribeMessage('game-result')
  async handleGameResult(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, winner, loser, type }: GameResultPayload,
  ) {
    this.logger.log(
      `[GameResult]`,
      `roomName: ${roomName}`,
      `winner: ${winner}`,
      `loser: ${loser}`,
      `type: ${type}`,
    );
    try {
      const result = await this.eventsService.saveGameResult(
        winner,
        loser,
        type,
      );
      this.nsp.to(roomName).emit('game-result', result);
    } catch (err) {
      socket.emit('game-fail', err.message);
    }
  }

  @SubscribeMessage('friend-list')
  async handleFriendList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[FriendList]`);
    try {
      const result = await this.eventsService.getFriendList(socket.id);
      socket.emit('friend-list', result);
    } catch (err) {
      socket.emit('friend-fail', err.message);
    }
  }

  @SubscribeMessage('friend-request-list')
  async handleFriendRequestList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[FriendRequestList]`);
    try {
      const result = await this.eventsService.getFriendRequestList(socket.id);
      socket.emit('friend-request-list', result);
    } catch (err) {
      socket.emit('friend-fail', err.message);
    }
  }

  @SubscribeMessage('request-friend')
  async handleFriendRequest(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    this.logger.log(`[FriendRequest] friendName: ${friendName}`);
    try {
      const result = await this.eventsService.friendRequest(
        socket.id,
        friendName,
      );
      const user = result.data.user;
      const friend = result.data.friend;
      socket.emit('request-friend', {
        userName: friendName,
        profile: friend.profile,
      });
      socket
        .to(friend.socketId)
        .emit('new-friend', { userName: user.userName, profile: user.profile });
    } catch (err) {
      socket.emit('friend-fail', err.message);
    }
  }

  @SubscribeMessage('response-friend')
  async handleAcceptFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { friendName, type }: { friendName: string; type: boolean },
  ) {
    this.logger.log(`[AcceptFriend] friendName: ${friendName}, type: ${type}`);
    try {
      const result = await this.eventsService.friendResponse(
        socket.id,
        friendName,
        type,
      );
      socket.emit('response-friend', result.sender);
      this.nsp.sockets.get(result.data)?.emit('friend-result', result.receiver);
    } catch (err) {
      socket.emit('friend-fail', err.message);
    }
  }

  @SubscribeMessage('cancel-friend')
  async handleCancelFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    this.logger.log(`[CancelFriend] friendName: ${friendName}`);
    try {
      const result = await this.eventsService.cancelFriend(
        socket.id,
        friendName,
      );
      socket.emit('cancel-friend', { userName: friendName });
      this.nsp.sockets
        .get(result.sock)
        ?.emit('cancel-friend', { userName: result.userName });
    } catch (err) {
      socket.emit('friend-fail', err.message);
    }
  }

  @SubscribeMessage('delete-friend')
  async handleDeleteFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendName: string,
  ) {
    this.logger.log(`DeleteFriend / friendName: ${friendName}`);
    try {
      const result = await this.eventsService.deleteFriend(
        socket.id,
        friendName,
      );
      socket.emit('delete-friend', { userName: friendName });
      this.nsp.sockets
        .get(result.sock)
        ?.emit('delete-friend', { userName: result.userName });
    } catch (err) {
      socket.emit('friend-fail', err.message);
    }
  }

  @SubscribeMessage('send-dm')
  async handleDirectMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[DirectMessage] userName: ${userName}`);
    try {
      const result = await this.eventsService.directMessage(
        socket.id,
        userName,
      );
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
    } catch (err) {
      socket.emit('chat-fail', err.message);
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
    try {
      const result = await this.eventsService.createChat(
        socket.id,
        roomName,
        type,
        password,
      );
      socket.join(roomName);
      socket.emit('create-success', { roomName, type, operator: result.data });
      this.nsp.emit('create-chat', { roomName, type, operator: result.data });
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, password }: { roomName: string; password: string },
  ) {
    this.logger.log(`[JoinChat] roomName: ${roomName}, password: ${password}`);
    try {
      const result = await this.eventsService.joinChat(
        socket.id,
        roomName,
        password,
      );
      socket.join(roomName);
      socket.broadcast.emit('join-chat', {
        message: result.msg,
        userName: result.joinuser,
        roomName,
      });
      socket.emit('join-chat-success', result.data);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('leave-chat')
  async handleLeaveChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`[LeaveChat] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.leaveChat(socket.id, roomName);
      socket.leave(roomName);
      socket.broadcast.emit('leave-chat', {
        message: result.msg,
        userName: result.userName,
        roomName: roomName,
        operator: result.operator,
      });
      socket.emit('leave-chat-success', roomName);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('chat-invite')
  async handleChatInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { userName, roomName }: { userName: string; roomName: string },
  ) {
    this.logger.log(
      `[ChatInvite] userName: ${userName}, roomName: ${roomName}`,
    );
    try {
      const result = await this.eventsService.chatInvite(
        socket.id,
        roomName,
        userName,
      );
      this.nsp.sockets
        .get(result.socket)
        ?.emit('chat-invite', { roomName, userName: result.userName });
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('chat-accept')
  async handleChatAccept(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`[ChatAccept] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.chatAccept(socket.id, roomName);
      const joinResult = await this.eventsService.joinChat(
        socket.id,
        roomName,
        result.password,
      );
      socket.join(roomName);
      socket.broadcast.emit('join-chat', {
        message: joinResult.msg,
        userName: joinResult.joinuser,
        roomName,
      });
      socket.emit('join-chat-success', joinResult.data);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('chat-reject')
  async handleChatReject(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { userName, roomName }: { userName: string; roomName: string },
  ) {
    this.logger.log(`[ChatReject] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.chatInviteInfo(
        socket.id,
        roomName,
        userName,
      );
      socket.emit('chat-reject', { roomName, userName: result.userName });
      this.nsp.sockets
        .get(result.socket)
        ?.emit('chat-reject', { roomName, userName: result.userName });
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('chat-cancel-invite')
  async handleChatCancel(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { userName, roomName }: { userName: string; roomName: string },
  ) {
    this.logger.log(`[ChatCancelInvite] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.chatInviteInfo(
        socket.id,
        roomName,
        userName,
      );
      socket.emit('chat-cancel-invite', { roomName, userName });
      this.nsp.sockets
        .get(result.socket)
        ?.emit('chat-cancel-invite', { roomName, userName: result.userName });
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
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
    const result = await this.eventsService.getChatList(socket.id);
    if (result.success) socket.emit('chat-list', { chats: result.chats });
    else socket.emit('chat-fail', { message: result.msg });
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
    try {
      const result = await this.eventsService.kickUser(
        socket.id,
        roomName,
        userName,
      );
      this.nsp.emit('kick-user', { roomName, userName });
      await this.nsp.sockets.get(result.data)?.leave(roomName);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('mute-user')
  async handleMuteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    this.logger.log(`[MuteUser] roomName: ${roomName}, userName: ${userName}`);
    try {
      const result = await this.eventsService.muteUser(
        socket.id,
        roomName,
        userName,
      );
      socket.emit('mute-user', { roomName, userName });
      this.nsp.sockets.get(result)?.emit('chat-muted', roomName);
    } catch (err) {
      socket.emit('chat-fail', err.message);
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
    try {
      const result = await this.eventsService.changePassword(
        socket.id,
        roomName,
        password,
      );
      socket.emit('chat-password', result);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
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
    try {
      const result = await this.eventsService.changeOperator(
        socket.id,
        roomName,
        operator,
      );
      this.nsp.to(roomName).emit('chat-operator', result);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('ban-list')
  async handleBanList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    this.logger.log(`[BanList] roomName: ${roomName}`);
    try {
      const result = await this.eventsService.getBanList(socket.id, roomName);
      socket.emit('ban-list', result);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('ban-user')
  async handleBanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    this.logger.log(`[BanUser] roomName: ${roomName}, userName: ${userName}`);
    try {
      const banResult = await this.eventsService.banUser(
        socket.id,
        roomName,
        userName,
      );
      const kickResult = await this.eventsService.kickUser(
        socket.id,
        roomName,
        userName,
      );
      this.nsp.emit('ban-user', { roomName, userName });
      await this.nsp.sockets.get(kickResult.data)?.leave(roomName);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('ban-cancel')
  async handleBanCancel(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { roomName, userName }: { roomName: string; userName: string },
  ) {
    this.logger.log(`[BanCancel] roomName: ${roomName}, userName: ${userName}`);
    try {
      await this.eventsService.banCancel(socket.id, roomName, userName);
      socket.emit('ban-cancel', { roomName, userName });
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('block-list')
  async handleBlockList(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[BlockList]`);
    try {
      const result = await this.eventsService.getBlockList(socket.id);
      socket.emit('block-list', result);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('block-user')
  async handleBlockUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[BlockUser] userName: ${userName}`);
    try {
      await this.eventsService.blockUser(socket.id, userName);
      socket.emit('block-user', userName);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
  }

  @SubscribeMessage('block-cancel')
  async handleBlockCancel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userName: string,
  ) {
    this.logger.log(`[BlockCancel] userName: ${userName}`);
    try {
      await this.eventsService.blockCancel(socket.id, userName);
      socket.emit('block-cancel', userName);
    } catch (err) {
      socket.emit('chat-fail', err.message);
    }
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
}
