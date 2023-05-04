import { Inject, Injectable } from '@nestjs/common';
import {
  ChatType,
  GameType,
  JoinType,
  UserStatusType,
} from 'src/entity/common.enum';
import { UserService } from 'src/user/user.service';
import { IChatRepository } from './repository/chat.interface.repository';
import { IChatUserRepository } from './repository/chatuser.interface.repository';
import * as bcrypt from 'bcrypt';
import { GameService } from 'src/game/game.service';
import { IBlockRepository } from './repository/block.interface.repository';
import { BanService } from 'src/ban/ban.service';
import { User } from 'src/entity/user.entity';
import { RecordService } from 'src/record/record.service';
import { GameDto } from 'src/dto/game.dto';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class EventsService {
  private rankQueue = '';
  constructor(
    @Inject('IChatRepository')
    private chatRepository: IChatRepository,
    @Inject('IChatUserRepository')
    private chatUserRepository: IChatUserRepository,
    @Inject('IBlockRepository')
    private blockRepository: IBlockRepository,
    private userService: UserService,
    private gameService: GameService,
    private banService: BanService,
    private recordService: RecordService,
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

  async directMessage(socketId: string, userName: string) {
    const sender = await this.userService.getUserBySocketId(socketId);
    const receiver = await this.userService.getUserByUserName(userName);
    if (!sender || !receiver)
      return { success: false, msg: `맞는 유저가 없습니다.` };
    const dm = await this.chatRepository.createByChatDto(
      {
        title: sender.userName + ',' + receiver.userName,
        type: ChatType.DM,
        operator: sender.userName,
        count: 2,
      },
      '',
    );
    await this.chatUserRepository.addChatUser(dm, sender);
    await this.chatUserRepository.addChatUser(dm, receiver);
    return {
      success: true,
      title: dm.title,
      senderName: sender.userName,
      receiverName: receiver.userName,
      receiverSocket: receiver.socketId,
    };
  }

  async changeUserName(socketId: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) return { success: false, msg: '없는 유저입니다.' };
    const result = await this.userService.updateUserName(user, userName);
    if (result) {
      return {
        success: true,
        data: {
          before: user.userName,
          after: userName,
        },
      };
    } else return { success: false, msg: '이미 사용 중인 이름입니다.' };
  }

  async changeUserProfile(socketId: string, image: Express.Multer.File) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) return { success: false, msg: '없는 유저입니다.' };
    const data = await this.userService.updateProfileImage(user, image);
    return { success: true, data: data };
  }

  async createGame(gameDto: GameDto, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (user.joinType != JoinType.NONE)
      return { success: false, msg: '이미 다른 방에 참여 중입니다.' };
    const game = await this.gameService.createGame(gameDto, user);
    if (!game)
      return { success: false, msg: '같은 이름의 방이 이미 존재합니다.' };

    await this.userService.updateOwnGame(user, game);

    return {
      success: true,
      data: {
        gameDto,
        ownerDto: this.userService.userToUserDto(user),
        opponentDto: null,
        watchersDto: null,
      },
    };
  }

  async joinGame(title: string, password: string, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (user.joinType != JoinType.NONE || user.playGame || user.watchGame)
      return { success: false, msg: '이미 다른 방에 참여 중입니다.' };
    const game = await this.gameService.getGameByTitleWithUsers(title);
    if (!game) return { success: false, data: '해당 방이 존재하지 않습니다.' };
    if (game.privateMode && !(await bcrypt.compare(password, game.password)))
      return { success: false, msg: '비밀번호가 맞지 않습니다.' };
    if (game.count == 2)
      return { success: false, msg: '해당 방에 자리가 없습니다.' };
    if (!game.players) return { success: false, data: '잘못된 방 입니다.' };

    await this.gameService.joinGame(user, game);
    await this.userService.updatePlayGame(user, game);

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
      success: true,
      data: { gameDto, ownerDto, opponentDto, watchersDto },
      user: this.userService.userToUserDto(user),
    };
  }

  async watchGame(title: string, password: string, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (user.joinType != JoinType.NONE || user.playGame || user.watchGame)
      return { success: false, msg: '이미 다른 방에 참여 중입니다.' };
    const game = await this.gameService.getGameByTitleWithUsers(title);
    if (!game) return { success: false, msg: '해당 방이 존재하지 않습니다.' };
    if (game.privateMode && !(await bcrypt.compare(password, game.password)))
      return { success: false, msg: '비밀번호가 맞지 않습니다.' };
    if (!game.players) return { success: false, msg: '잘못된 방 입니다.' };

    await this.gameService.watchGame(user, game);
    await this.userService.updateWatchGame(user, game);

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
      success: true,
      data: { gameDto, ownerDto, opponentDto, watchersDto },
      user: this.userService.userToUserDto(user),
    };
  }

  async leaveGame(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (!user) return { success: false, msg: '잘못된 유저 정보입니다.' };
    if (user.joinType === JoinType.NONE)
      return { success: false, msg: '참여 중인 방이 존재하지 않습니다.' };

    if (user.joinType === JoinType.OWNER) {
      const game = await this.gameService.getGameByTitleWithUsers(
        user.playGame.title,
      );
      await game.players.map(async (player) => {
        await this.userService.updateGameNone(player);
      });
      await game.watchers.map(async (watcher) => {
        await this.userService.updateGameNone(watcher);
      });
      await this.gameService.leaveGame(user);
    } else {
      await this.gameService.leaveGame(user);
      await this.userService.updateGameNone(user);
    }
    return {
      success: true,
      user: this.userService.userToUserDto(user),
      type: user.joinType,
    };
  }

  async createChat(
    socketId: string,
    roomName: string,
    type: ChatType,
    password: string,
  ) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) return { success: false, msg: `맞는 유저가 없습니다.` };
    const exist = await this.chatRepository.findByTitle(roomName);
    if (exist)
      return { success: false, msg: `${roomName} 방이 이미 존재합니다.` };
    const chat = await this.chatRepository.createByChatDto(
      {
        title: roomName,
        type: type,
        operator: user.userName,
        count: 1,
      },
      password,
    );
    await this.chatUserRepository.addChatUser(chat, user);
    return {
      success: true,
      msg: `${roomName} 채팅방이 생성되었습니다.`,
      data: user.userName,
    };
  }

  async joinChat(socketId: string, roomName: string, password: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) return { success: false, msg: `맞는 유저가 없습니다.` };
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (
      chat.type === ChatType.PASSWORD &&
      !(await bcrypt.compare(password, chat.password))
    )
      return { success: false, msg: `비밀번호가 맞지 않습니다.` };
    const joined = chat.users.filter(
      (usr) => usr.user.userName === user.userName,
    );
    if (joined.length !== 0)
      return { success: false, msg: `${roomName}에 이미 참가 중 입니다.` };
    const ban = chat.banUsers.filter((ban) => ban.userName === user.userName);
    if (ban.length !== 0)
      return { success: false, msg: `${roomName}에 밴 되어있습니다.` };
    await this.chatUserRepository.addChatUser(chat, user);
    await this.chatRepository.updateCount(chat.id, chat.count + 1);
    const userNames = chat.users.map((usr) => {
      if (usr.user) return usr.user.userName;
      return '';
    });
    return {
      success: true,
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

  async leaveChat(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    if (!user) return { success: false, msg: `맞는 유저가 없습니다.` };
    let chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (!chat) return { success: false, msg: `맞는 채팅방이 없습니다.` };
    const chatUser = await this.chatUserRepository.findByBoth(chat, user);
    if (chatUser.length === 0)
      return { success: false, msg: `참여 중인 방이 없습니다.` };
    await this.chatUserRepository.deleteChatUser(chatUser);
    if (chat.count <= 1) await this.chatRepository.deleteChat(chat);
    else {
      await this.chatRepository.updateCount(chat.id, chat.count - 1);
      chat = await this.chatRepository.findByTitleWithJoin(roomName);
      if (chat.operator === user.userName) {
        await this.chatRepository.updateOperator(
          chat.id,
          chat.users[0].user.userName,
        );
      }
    }
    return {
      success: true,
      msg: `${user.userName}가 나갔습니다.`,
      userName: user.userName,
      operator: chat.users[0].user.userName,
    };
  }

  async matchRankGame(socketId: string) {
    if (this.rankQueue === '') {
      this.rankQueue = socketId;
      return null;
    }
    const opponent = await this.userService.getUserBySocketId(socketId);
    const owner = await this.userService.getUserBySocketId(this.rankQueue);
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
    if (!winner || !loser)
      return { success: false, msg: '유저 이름이 맞지 않습니다.' };
    await this.recordService.saveGameResult(winner, loser, type);
    return {
      success: true,
      roomName: winner.playGame.title,
      data: { winner: win, loser: lose, type: type },
    };
  }

  async getAllChatList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithChat(socketId);
    const chats = await this.chatRepository.findAll();
    const chatsDto = chats.map((chat) => {
      return this.chatRepository.chatToChatDto(chat);
    });
    return { user: user.userName, chats: chatsDto };
  }

  async getChatList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithChat(socketId);
    if (user.chats.length === 0) return { user: user.userName, chats: [] };
    const chatsDto = user.chats.map((chat) => {
      return this.chatRepository.chatToChatDto(chat.chat);
    });
    return { user: user.userName, chats: chatsDto };
  }

  async getUserList(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    const usersDto = chat.users.map((usr) => {
      return this.userService.userToUserDto(usr.user);
    });
    return { user: user.userName, users: usersDto };
  }

  async kickUser(socketId: string, roomName: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const data = chat.users.filter((usr) => usr.user.userName === userName);
    if (data.length === 0)
      return { success: false, msg: `${roomName}에 ${userName}가 없습니다.` };
    const kicked = await this.userService.getUserByUserName(userName);
    const chatuser = await this.chatUserRepository.findByBoth(chat, kicked);
    await this.chatUserRepository.deleteChatUser(chatuser);
    await this.chatRepository.updateCount(chat.id, chat.count - 1);
    return {
      success: true,
      msg: `${userName}가 ${roomName}에서 강퇴되었습니다.`,
      data: kicked.socketId,
    };
  }

  async muteUser(socketId: string, roomName: string, userName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const muted = await this.userService.getUserByUserName(userName);
    if (!muted) return { success: false, msg: `${userName} 유저가 없습니다.` };
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const data = chat.users.filter((usr) => usr.user.userName === userName);
    if (data.length === 0)
      return { success: false, msg: `${roomName}에 ${userName}가 없습니다.` };
    return {
      success: true,
      data: muted.socketId,
    };
  }

  async changePassword(socketId: string, roomName: string, password: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    await this.chatRepository.updatePassword(chat, password);
    return {
      success: true,
      msg: `${roomName}의 비밀번호가 바뀌었습니다.`,
    };
  }

  async changeOperator(socketId: string, roomName: string, operator: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const data = chat.users.filter((usr) => usr.user.userName === operator);
    if (data.length === 0)
      return { success: false, msg: `${roomName}에 ${operator}가 없습니다.` };
    await this.chatRepository.updateOperator(chat.id, operator);
    return {
      success: true,
      data: { roomName, operator },
    };
  }

  async getBanList(socketId: string, roomName: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${roomName}의 방장이 아닙니다.` };
    const users = chat.banUsers.map((usr) => {
      return usr.user.userName;
    });
    return {
      success: true,
      msg: `${roomName} 밴 유저 리스트 요청 완료`,
      data: users,
    };
  }

  async banUser(socketId: string, roomName: string, banUser: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${user.userName}의 방장이 아닙니다.` };
    const isBan = chat.banUsers.filter((ban) => ban.userName === banUser);
    if (isBan.length !== 0)
      return { success: false, msg: `${banUser}는 이미 밴 되어있습니다.` };
    await this.banService.addBanUser(chat, banUser);
    return { success: true, msg: `${banUser}가 밴 되었습니다.` };
  }

  async banCancel(socketId: string, roomName: string, banUser: string) {
    const user = await this.userService.getUserBySocketId(socketId);
    const chat = await this.chatRepository.findByTitleWithJoin(roomName);
    if (chat.operator !== user.userName)
      return { success: false, msg: `${user.userName}의 방장이 아닙니다.` };
    const ban = chat.banUsers.filter((ban) => ban.userName === banUser);
    if (ban.length === 0)
      return { success: false, msg: `${banUser}는 밴 되어있지 않습니다.` };
    await this.banService.deleteBanUser(ban);
    return { success: true, msg: `${banUser}의 밴이 취소되었습니다.` };
  }

  async getBlockList(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithBlock(socketId);
    const blockUsers = user.blockUsers.map((usr) => {
      return usr.user.blockuser;
    });
    return blockUsers;
  }

  async blockUser(socketId: string, blockUser: string) {
    const user = await this.userService.getUserBySocketIdWithBlock(socketId);
    const isBan = user.blockUsers.filter(
      (block) => block.blockUser === blockUser,
    );
    if (isBan.length !== 0)
      return { success: false, msg: `${blockUser}는 이미 차단 되어있습니다.` };
    await this.blockRepository.addBlockUser(user, blockUser);
    return { success: true, msg: `${blockUser}가 차단 되었습니다.` };
  }

  async blockCancel(socketId: string, blockUser: string) {
    const user = await this.userService.getUserBySocketIdWithBlock(socketId);
    const block = user.blockUsers.filter(
      (block) => block.blockUser === blockUser,
    );
    if (block.length === 0)
      return { success: false, msg: `${blockUser}는 차단 되어있지 않습니다.` };
    await this.blockRepository.deleteBlockUser(block);
    return { success: true, msg: `${blockUser}의 차단이 해제되었습니다.` };
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
