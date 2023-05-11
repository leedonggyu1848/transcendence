import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from 'src/chat/repository/chat.interface.repository';
import { IChatUserRepository } from 'src/chat/repository/chatuser.interface.repository';
import { ChatDto } from 'src/dto/chat.dto';
import { Chat } from 'src/entity/chat.entity';
import { ChatType } from 'src/entity/common.enum';
import { User } from 'src/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { AdministratorService } from 'src/administrator/administrator.service';
import { AdministratorRepository } from 'src/administrator/repository/administrator.repository';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject('IChatRepository')
    private chatRepository: IChatRepository,
    @Inject('IChatUserRepository')
    private chatUserRepository: IChatUserRepository,
    private userService: UserService,
    private administratorService: AdministratorService,
  ) {}

  chatToChatDto(chat: Chat) {
    const chatDto: ChatDto = {
      title: chat.title,
      type: chat.type,
      owner: chat.owner,
      count: chat.count,
    };
    return chatDto;
  }

  async getChatByTitle(title: string) {
    return await this.chatRepository.findByTitle(title);
  }

  async getChatByTitleWithUser(title: string) {
    return await this.chatRepository.findByTitleWithJoin(title);
  }

  async getAllChat() {
    return await this.chatRepository.findAll();
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async updatePassword(chat: Chat, password: string) {
    await this.chatRepository.updatePassword(chat, password);
    if (password === '') {
      await this.chatRepository.updateType(chat, ChatType.PUBLIC);
      return ChatType.PUBLIC;
    } else if (chat.type === ChatType.PUBLIC) {
      await this.chatRepository.updateType(chat, ChatType.PASSWORD);
      return ChatType.PASSWORD;
    }
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async updateOwner(chat: Chat, owner: number) {
    await this.chatRepository.updateOwner(chat, owner);
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async createDirectMessage(sender: User, receiver: User) {
    const tmpChat1 = await this.chatRepository.findByTitleWithJoin(
      sender.userName + ',' + receiver.userName,
    );
    if (tmpChat1) {
      await this.joinChat(sender, tmpChat1);
      return tmpChat1.title;
    }
    const tmpChat2 = await this.chatRepository.findByTitleWithJoin(
      receiver.userName + ',' + sender.userName,
    );
    if (tmpChat2) {
      await this.joinChat(sender, tmpChat2);
      return tmpChat2.title;
    }
    const dm = await this.chatRepository.createByChatDto(
      {
        title: sender.userName + ',' + receiver.userName,
        type: ChatType.DM,
        owner: sender.userId,
        count: 2,
      },
      '',
    );
    await this.chatUserRepository.addChatUser(dm, sender);
    await this.chatUserRepository.addChatUser(dm, receiver);
    return dm.title;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async createChat(
    user: User,
    roomName: string,
    type: ChatType,
    password: string,
  ) {
    const chat = await this.chatRepository.createByChatDto(
      {
        title: roomName,
        type: type,
        owner: user.userId,
        count: 1,
      },
      password,
    );
    await this.chatUserRepository.addChatUser(chat, user);
    return chat;
  }

  async checkPassword(chat: Chat, password: string) {
    if (chat.type !== ChatType.PASSWORD) return true;
    if (!(await bcrypt.compare(password, chat.password))) return false;
    return true;
  }

  checkBaned(user: User, chat: Chat) {
    const ban = chat.banUsers.filter((ban) => ban.userId === user.userId);
    if (ban.length !== 0) return true;
    return false;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async joinChat(user: User, chat: Chat) {
    const joined = chat.users.filter(
      (usr) => usr.user.userName === user.userName,
    );
    if (joined.length !== 0) return false;
    await this.chatUserRepository.addChatUser(chat, user);
    await this.chatRepository.updateCount(chat, chat.count + 1);
    return true;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async leaveChat(user: User, chat: Chat) {
    const chatUser = await this.chatUserRepository.findByBoth(chat, user);
    if (chatUser.length === 0) return false;
    await this.chatUserRepository.deleteChatUser(chatUser);
    if (chat.count <= 1) await this.chatRepository.deleteChat(chat);
    else {
      await this.chatRepository.updateCount(chat, chat.count - 1);
      const result = await this.chatRepository.findByTitleWithJoin(chat.title);
      if (result.owner === user.userId) {
        const newOwner = await this.userService.getUserByUserId(
          result.administrators.length !== 0
            ? result.administrators[0].userId
            : result.users[0].user.userId,
        );
        await this.chatRepository.updateOwner(result, newOwner.userId);
        await this.administratorService.addAdministrator(result, newOwner);
      }
    }
    return true;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async kickUser(chat: Chat, kickUser: User) {
    const chatuser = await this.chatUserRepository.findByBoth(chat, kickUser);
    await this.chatUserRepository.deleteChatUser(chatuser);
    await this.chatRepository.updateCount(chat, chat.count - 1);
  }
}
