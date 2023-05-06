import { Injectable } from '@nestjs/common';
import {
  ChatType,
  GameType,
  JoinType,
  UserStatusType,
} from 'src/entity/common.enum';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { GameService } from 'src/game/game.service';
import { BanService } from 'src/ban/ban.service';
import { User } from 'src/entity/user.entity';
import { RecordService } from 'src/record/record.service';
import { GameDto } from 'src/dto/game.dto';
import { UserDto } from 'src/dto/user.dto';
import { BlockService } from 'src/block/block.service';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { FriendService } from 'src/friend/friend.service';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class EventsService {
  private rankQueue = '';
  private muteQueue = [];
  constructor(
    private userService: UserService,
    private gameService: GameService,
    private friendService: FriendService,
    private banService: BanService,
    private blockService: BlockService,
    private recordService: RecordService,
    private chatService: ChatService,
  ) {}

  private getSocketRooms(user: User) {
    let chatRooms = [];
    if (user.chats) {
      chatRooms = user.chats.map((chat) => {
        return chat.chat.title;
      });
    }
    let gameRooms = [];
    if (user.playGame) gameRooms.push(user.playGame.title);
    if (user.watchGame) gameRooms.push(user.watchGame.title);
    return { chatRooms, gameRooms };
  }

  async getSocketInfo(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithAll(socketId);
    if (!user) return null;
    const rooms = this.getSocketRooms(user);
    return {
      userName: user.userName,
      chatRooms: rooms.chatRooms,
      gameRooms: rooms.gameRooms,
    };
  }

  async registUser(userName: string, socketId: string) {
    const user = await this.userService.getUserByUserNameWithAll(userName);
    await this.userService.updateSocketId(user, socketId);
    const rooms = this.getSocketRooms(user);
    return [...rooms.chatRooms, ...rooms.gameRooms];
  }

  async isConnect(userName: string) {
    const user = await this.userService.getUserByUserName(userName);
    let status: UserStatusType;
    if (user.socketId === '') status = UserStatusType.OFFLINE;
    else if (!user.playGame) status = UserStatusType.ONLINE;
    else status = UserStatusType.PLAYING;
    return status;
  }

  async changeUserName(socketId: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error('없는 유저입니다.');
    const result = await this.userService.updateUserName(user, userName);
    if (!result) throw new Error('이미 사용 중인 이름입니다.');
    return {
      before: user.userName,
      after: userName,
    };
  }

  async changeUserProfile(socketId: string, image: Buffer) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error('없는 유저입니다.');
    return await this.userService.updateProfileImage(user, image);
  }

  async createGame(gameDto: GameDto, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (user.joinType != JoinType.NONE)
      throw new Error('이미 다른 방에 참여 중입니다.');
    const game = await this.gameService.createGame(gameDto, user);
    if (!game) throw new Error('같은 이름의 방이 이미 존재합니다.');
    return {
      gameDto,
      ownerDto: this.userService.userToUserDto(user),
      opponentDto: null,
      watchersDto: null,
    };
  }

  async joinGame(title: string, password: string, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (user.joinType != JoinType.NONE || user.playGame || user.watchGame)
      throw new Error('이미 다른 방에 참여 중입니다.');
    const game = await this.gameService.getGameByTitleWithUsers(title);
    if (!game) throw new Error('해당 방이 존재하지 않습니다.');
    if (game.privateMode && !(await bcrypt.compare(password, game.password)))
      throw new Error('비밀번호가 맞지 않습니다.');
    if (game.count == 2) throw new Error('해당 방에 자리가 없습니다.');
    if (!game.players) throw new Error('잘못된 방 입니다.');
    await this.gameService.joinGame(user, game);
    const gameDto: GameDto = this.gameService.gameToGameDto(game);
    const owner = game.players.find(
      (player) => player.joinType === JoinType.OWNER,
    );
    const ownerDto: UserDto = this.userService.userToUserDto(owner);
    const opponentDto: UserDto = this.userService.userToUserDto(user);
    let watchersDto: UserDto[];
    if (game.watchers) {
      const watchers = game.watchers.filter(
        (user) => user.joinType === JoinType.WATCHER,
      );
      watchersDto = watchers.map((element) =>
        this.userService.userToUserDto(element),
      );
    } else watchersDto = null;
    return {
      data: { gameDto, ownerDto, opponentDto, watchersDto },
      user: this.userService.userToUserDto(user),
    };
  }

  async watchGame(title: string, password: string, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (user.joinType != JoinType.NONE || user.playGame || user.watchGame)
      throw new Error('이미 다른 방에 참여 중입니다.');
    const game = await this.gameService.getGameByTitleWithUsers(title);
    if (!game) throw new Error('해당 방이 존재하지 않습니다.');
    if (game.privateMode && !(await bcrypt.compare(password, game.password)))
      throw new Error('비밀번호가 맞지 않습니다.');
    if (!game.players) throw new Error('잘못된 방 입니다.');
    await this.gameService.watchGame(user, game);
    const owner = game.players.find(
      (player) => player.joinType === JoinType.OWNER,
    );
    const player = game.players.find(
      (player) => player.joinType === JoinType.PLAYER,
    );
    let watchersDto: UserDto[];
    if (game.watchers) {
      watchersDto = game.watchers.map((watcher) =>
        this.userService.userToUserDto(watcher),
      );
    } else watchersDto = null;
    const gameDto: GameDto = this.gameService.gameToGameDto(game);
    const ownerDto: UserDto = this.userService.userToUserDto(owner);
    const opponentDto: UserDto = this.userService.userToUserDto(player);
    return {
      data: { gameDto, ownerDto, opponentDto, watchersDto },
      user: this.userService.userToUserDto(user),
    };
  }

  async leaveGame(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (!user) throw new Error('잘못된 유저 정보입니다.');
    if (user.joinType === JoinType.NONE || !user.playGame)
      throw new Error('참여 중인 방이 존재하지 않습니다.');
    const game = await this.gameService.getGameByTitleWithUsers(
      user.playGame.title,
    );
    await this.gameService.leaveGame(game, user);
    return {
      user: this.userService.userToUserDto(user),
      type: user.joinType,
    };
  }

  async gameInvite(socketId: string, userName: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const invited = await this.userService.getUserByUserName(userName);
    if (!user || !invited) throw new Error('잘못된 유저 정보입니다.');
    if (user.joinType !== JoinType.OWNER)
      throw new Error('게임의 방장이 아닙니다.');
    if (invited.socketId === '') throw new Error('유저가 접속 중이 아닙니다.');
    if (invited.JoinType !== JoinType.NONE)
      throw new Error('이미 다른 게임에 참가 중입니다.');
    const game = await this.gameService.getGameByTitleWithUsers(roomName);
    if (!game) throw new Error('해당 방이 존재하지 않습니다.');
    if (!game.players) throw new Error('잘못된 방 입니다.');
    return {
      invitedSocektId: invited.socketId,
      invitorUserName: user.userName,
    };
  }

  async gameAccept(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error('잘못된 유저 정보입니다.');
    if (user.JoinType !== JoinType.NONE)
      throw new Error('이미 다른 게임에 참가 중입니다.');
    const game = await this.gameService.getGameByTitleWithUsers(roomName);
    if (!game) throw new Error('해당 방이 존재하지 않습니다.');
    if (!game.players) throw new Error('잘못된 방 입니다.');
    if (game.players.length > 1) throw new Error('방에 빈 자리가 없습니다.');
    return { userName: user.userName, password: game.password };
  }

  async gameInviteInfo(socketId: string, userName: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const opponent = await this.userService.getUserByUserName(userName);
    if (!user || !opponent) throw new Error('잘못된 유저 정보입니다.');
    const game = await this.gameService.getGameByTitleWithUsers(roomName);
    if (!game) throw new Error('해당 방이 존재하지 않습니다.');
    return {
      userName: user.userName,
      socket: opponent.socketId,
    };
  }

  async matchRankGame(socketId: string) {
    if (this.rankQueue === '') {
      this.rankQueue = socketId;
      return null;
    }
    const opponent = await this.userService.getUserBySocketId(socketId);
    const owner = await this.userService.getUserBySocketId(this.rankQueue);
    await this.userService.updateMatchRank(opponent);
    await this.userService.updateMatchRank(owner);
    this.rankQueue = '';
    return {
      roomName: `${owner.userName} vs ${opponent.userName}`,
      owner: this.userService.userToUserDto(owner),
      opponent: this.userService.userToUserDto(opponent),
      socketId: owner.socketId,
    };
  }

  cancelRankGame(socketId: string) {
    if (this.rankQueue === socketId) this.rankQueue = '';
  }

  async saveGameResult(win: string, lose: string, type: GameType) {
    const winner = await this.userService.getUserByUserNameWithGame(win);
    const loser = await this.userService.getUserByUserNameWithGame(lose);
    if (!winner || !loser) throw new Error('유저 이름이 맞지 않습니다.');
    await this.recordService.saveGameResult(winner, loser, type);
    return {
      winner: win,
      loser: lose,
      type: type,
    };
  }

  async getFriendList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithFriend(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    if (user.friends.length === 0) return [];
    return await this.friendService.getFriendList(user);
  }

  async getFriendRequestList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithFriend(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    const sendDto = this.friendService.getFriendRequestSend(user);
    const receiveDto = await this.friendService.getFriendRequestReceive(user);
    return [...sendDto, ...receiveDto];
  }

  async friendRequest(socketId: string, friendName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const friend = await this.userService.getUserByUserName(friendName);
    if (!user || !friend) throw new Error('없는 유저입니다.');
    const result = await this.friendService.friendRequest(user, friend);
    if (!result) throw new Error('이미 친구 신청을 보냈습니다.');
    return {
      data: { user, friend },
      msg: `${user.userName}가 ${friendName}에게 친구 신청을 보냈습니다.`,
    };
  }

  async friendResponse(socketId: string, friendName: string, type: boolean) {
    const user = await this.userService.getUserBySocketId(socketId);
    const friend = await this.userService.getUserByUserNameWithFriend(
      friendName,
    );
    if (!user || !friend) throw new Error('없는 유저입니다.');
    const result = await this.friendService.friendResponse(user, friend, type);
    if (!result) throw new Error('친구 신청이 없거나 이미 처리되었습니다.');
    return {
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
    if (!user || !friend) throw new Error('없는 유저입니다.');
    const result = await this.friendService.cancelFriend(user, friend);
    if (!result) throw new Error(`${friendName}에게 보낸 요청이 없습니다.`);
    return {
      sock: friend.socketId,
      userName: user.userName,
    };
  }

  async deleteFriend(socketId: string, friendName: string) {
    const user = await this.userService.getUserBySocketIdWithFriend(socketId);
    const friend = await this.userService.getUserByUserNameWithFriend(
      friendName,
    );
    if (!user || !friend) throw new Error('없는 유저입니다.');
    const result = await this.friendService.deleteFriend(user, friend);
    if (!result) throw new Error(`${friendName} 유저와 친구가 아닙니다.`);
    return { sock: friend.socketId, userName: user.userName };
  }

  async directMessage(socketId: string, userName: string) {
    const sender = await this.userService.getUserBySocketId(socketId);
    const receiver = await this.userService.getUserByUserName(userName);
    if (!sender || !receiver) throw new Error(`맞는 유저가 없습니다.`);
    const title = await this.chatService.createDirectMessage(sender, receiver);
    return {
      title: title,
      senderName: sender.userName,
      receiverName: receiver.userName,
      receiverSocket: receiver.socketId,
    };
  }

  async createChat(
    socketId: string,
    roomName: string,
    type: ChatType,
    password: string,
  ) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error(`맞는 유저가 없습니다.`);
    const result = await this.chatService.createChat(
      user,
      roomName,
      type,
      password,
    );
    if (!result) throw new Error(`${roomName} 방이 이미 존재합니다.`);
    return {
      msg: `${roomName} 채팅방이 생성되었습니다.`,
      data: user.userName,
    };
  }

  async joinChat(socketId: string, roomName: string, password: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error(`맞는 유저가 없습니다.`);
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error(`맞는 채팅 방이 없습니다.`);
    const pass = await this.chatService.checkPassword(chat, password);
    if (!pass) throw new Error(`비밀번호가 맞지 않습니다.`);
    const ban = this.chatService.checkBaned(user, chat);
    if (ban) throw new Error(`${roomName}에 밴 되어있습니다.`);
    const result = await this.chatService.joinChat(user, chat);
    if (!result) throw new Error(`${roomName}에 이미 참가 중 입니다.`);
    const userNames = chat.users.map((usr) => {
      if (usr.user) return usr.user.userName;
      return '';
    });
    return {
      msg: `${user.userName}가 들어왔습니다.`,
      joinuser: user.userName,
      data: {
        roomName: roomName,
        operator: chat.operator,
        type: chat.type,
        users: userNames,
      },
    };
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async leaveChat(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error(`맞는 유저가 없습니다.`);
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error(`맞는 채팅방이 없습니다.`);
    const result = await this.chatService.leaveChat(user, chat);
    if (!result) throw new Error(`참여 중인 방이 없습니다.`);
    return {
      msg: `${user.userName}가 나갔습니다.`,
      userName: user.userName,
      operator: chat.users[0].user.userName,
    };
  }

  async chatInvite(socketId: string, roomName: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const invited = await this.userService.getUserByUserName(userName);
    if (!user || !invited) throw new Error(`맞는 유저가 없습니다.`);
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error(`맞는 채팅방이 없습니다.`);
    const data = chat.users.filter((usr) => usr.user.userName === userName);
    if (data.length !== 0) throw new Error(`${roomName}에 이미 참여 중입니다.`);
    return { userName: user.userName, socket: invited.socketId };
  }

  async chatAccept(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error(`맞는 유저가 없습니다.`);
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error(`맞는 채팅방이 없습니다.`);
    const data = chat.users.filter(
      (usr) => usr.user.userName === user.userName,
    );
    if (data.length !== 0) throw new Error(`${roomName}에 이미 참여 중입니다.`);
    return { userName: user.userName, password: chat.password };
  }

  async chatInviteInfo(socketId: string, roomName: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const opponent = await this.userService.getUserByUserName(userName);
    if (!user || !opponent) throw new Error(`맞는 유저가 없습니다.`);
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error(`맞는 채팅방이 없습니다.`);
    return {
      userName: user.userName,
      socket: opponent.socketId,
    };
  }

  async getAllChatList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithChat(socketId);
    const chats = await this.chatService.getAllChat();
    const chatsDto = chats.map((chat) => {
      return this.chatService.chatToChatDto(chat);
    });
    return { user: user.userName, chats: chatsDto };
  }

  async getChatList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithChat(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    if (user.chats.length === 0) return { success: true, chats: [] };
    const chatsDto = user.chats.map((chat) => {
      return this.chatService.chatToChatDto(chat.chat);
    });
    return chatsDto;
  }

  async getUserList(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    const usersDto = chat.users.map((usr) => {
      return this.userService.userToUserDto(usr.user);
    });
    return { user: user.userName, users: usersDto };
  }

  async kickUser(socketId: string, roomName: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error('해당하는 채팅방이 없습니다.');
    if (chat.operator !== user.userName)
      throw new Error(`${roomName}의 방장이 아닙니다.`);
    const data = chat.users.filter((usr) => usr.user.userName === userName);
    if (data.length === 0)
      throw new Error(`${roomName}에 ${userName}가 없습니다.`);
    const kickUser = await this.userService.getUserByUserName(userName);
    await this.chatService.kickUser(chat, kickUser);
    return {
      msg: `${userName}가 ${roomName}에서 강퇴되었습니다.`,
      data: kickUser.socketId,
    };
  }

  async muteUser(socketId: string, roomName: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const mutedUser = await this.userService.getUserByUserName(userName);
    if (!mutedUser) throw new Error(`${userName} 유저가 없습니다.`);
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error('해당하는 채팅방이 없습니다.');
    if (chat.operator !== user.userName)
      throw new Error(`${roomName}의 방장이 아닙니다.`);
    const data = chat.users.filter((usr) => usr.user.userName === userName);
    if (data.length === 0)
      throw new Error(`${roomName}에 ${userName}가 없습니다.`);
    this.muteQueue.push([roomName, userName, new Date().getTime() + 30000]);
    setTimeout(() => {
      this.muteQueue.shift();
    }, 30000);
    return mutedUser.socketId;
  }

  checkMuteQueue(roomName: string, userName: string) {
    let flag = true;
    let leftTime = 0;
    this.muteQueue.forEach(([targetRoom, targetName, targetTime]) => {
      const now = new Date();
      leftTime = Math.floor((targetTime - now.getTime()) / 1000);
      if (targetRoom === roomName && targetName === userName) flag = false;
    });
    return { flag, leftTime };
  }

  async changePassword(socketId: string, roomName: string, password: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error('해당하는 채팅방이 없습니다.');
    if (chat.operator !== user.userName)
      throw new Error(`${roomName}의 방장이 아닙니다.`);
    await this.chatService.updatePassword(chat, password);
    return `${roomName}의 비밀번호가 바뀌었습니다.`;
  }

  async changeOperator(socketId: string, roomName: string, operator: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error('해당하는 채팅방이 없습니다.');
    if (chat.operator !== user.userName)
      throw new Error(`${roomName}의 방장이 아닙니다.`);
    const data = chat.users.filter((usr) => usr.user.userName === operator);
    if (data.length === 0)
      throw new Error(`${roomName}에 ${operator}가 없습니다.`);
    await this.chatService.updateOperator(chat.id, operator);
    return { roomName, operator };
  }

  async getBanList(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error('해당하는 채팅방이 없습니다.');
    if (chat.operator !== user.userName)
      throw new Error(`${roomName}의 방장이 아닙니다.`);
    const users = chat.banUsers.map((usr) => {
      return usr.user.userName;
    });
    return users;
  }

  async banUser(socketId: string, roomName: string, banUser: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error('해당하는 채팅방이 없습니다.');
    if (chat.operator !== user.userName)
      throw new Error(`${user.userName}의 방장이 아닙니다.`);
    const isBan = chat.banUsers.filter((ban) => ban.userName === banUser);
    if (isBan.length !== 0)
      throw new Error(`${banUser}는 이미 밴 되어있습니다.`);
    await this.banService.addBanUser(chat, banUser);
    return `${banUser}가 밴 되었습니다.`;
  }

  async banCancel(socketId: string, roomName: string, banUser: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    const chat = await this.chatService.getChatByTitleWithUser(roomName);
    if (!chat) throw new Error('해당하는 채팅방이 없습니다.');
    if (chat.operator !== user.userName)
      throw new Error(`${user.userName}의 방장이 아닙니다.`);
    const ban = chat.banUsers.filter((ban) => ban.userName === banUser);
    if (ban.length === 0) throw new Error(`${banUser}는 밴 되어있지 않습니다.`);
    await this.banService.deleteBanUser(ban);
  }

  async getBlockList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithBlock(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    return this.blockService.getBlockList(user);
  }

  async blockUser(socketId: string, blockUser: string) {
    const user = await this.userService.getUserBySocketIdWithBlock(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    const result = await this.blockService.blockUser(user, blockUser);
    if (result) throw new Error(`${blockUser}는 이미 차단 되어있습니다.`);
  }

  async blockCancel(socketId: string, blockUser: string) {
    const user = await this.userService.getUserBySocketIdWithBlock(socketId);
    if (!user) throw new Error('맞는 유저가 없습니다.');
    const result = await this.blockService.blockCancel(user, blockUser);
    if (result) throw new Error(`${blockUser}는 차단 되어있지 않습니다.`);
  }

  async gameAlert(roomName: string, message: string) {
    const game = await this.gameService.getGameByTitleWithUsers(roomName);
    const players = game.players.map((player) => {
      return this.userService.userToUserDto(player);
    });
    const data = players.map((player) => {
      return {
        userName: player.userName,
        message: `${player.userName}` + message,
      };
    });
    return data;
  }
}
