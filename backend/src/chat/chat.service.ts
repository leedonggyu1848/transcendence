import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from 'src/chat/repository/chat.interface.repository';
import { IChatUserRepository } from 'src/chat/repository/chatuser.interface.repository';
import { ChatDto } from 'src/dto/chat.dto';
import { Chat } from 'src/entity/chat.entity';
import { ChatType } from 'src/entity/common.enum';
import { User } from 'src/entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
  constructor(
    @Inject('IChatRepository')
    private chatRepository: IChatRepository,
    @Inject('IChatUserRepository')
    private chatUserRepository: IChatUserRepository,
  ) {}

  chatToChatDto(chat: Chat) {
    const chatDto: ChatDto = {
      title: chat.title,
      type: chat.type,
      operator: chat.operator,
      count: chat.count,
    };
    return chatDto;
  }

  async getChatByTitleWithUser(title: string) {
    return await this.chatRepository.findByTitleWithJoin(title);
  }

  async getAllChat() {
    return await this.chatRepository.findAll();
  }

  async updatePassword(chat: Chat, password: string) {
    await this.chatRepository.updatePassword(chat, password);
  }

  async updateOperator(chat: Chat, operator: string) {
    await this.chatRepository.updateOperator(chat.id, operator);
  }

  async createDirectMessage(sender: User, receiver: User) {
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
    return dm.title;
  }

  async createChat(
    user: User,
    roomName: string,
    type: ChatType,
    password: string,
  ) {
    const exist = await this.chatRepository.findByTitle(roomName);
    if (exist) return false;
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
  }

  async checkPassword(chat: Chat, password: string) {
    if (chat.type !== ChatType.PASSWORD) return true;
    if (!(await bcrypt.compare(password, chat.password))) return false;
    return true;
  }

  checkBaned(user: User, chat: Chat) {
    const ban = chat.banUsers.filter((ban) => ban.userName === user.userName);
    if (ban.length !== 0) return true;
    return false;
  }

  async joinChat(user: User, chat: Chat) {
    const joined = chat.users.filter(
      (usr) => usr.user.userName === user.userName,
    );
    if (joined.length !== 0) return false;
    await this.chatUserRepository.addChatUser(chat, user);
    await this.chatRepository.updateCount(chat.id, chat.count + 1);
    return true;
  }

  async leaveChat(user: User, chat: Chat) {
    const chatUser = await this.chatUserRepository.findByBoth(chat, user);
    if (chatUser.length === 0) return false;
    await this.chatUserRepository.deleteChatUser(chatUser);
    if (chat.count <= 1) await this.chatRepository.deleteChat(chat);
    else {
      await this.chatRepository.updateCount(chat.id, chat.count - 1);
      chat = await this.chatRepository.findByTitleWithJoin(chat.title);
      if (chat.operator === user.userName) {
        await this.chatRepository.updateOperator(
          chat.id,
          chat.users[0].user.userName,
        );
      }
    }
    return true;
  }

  async kickUser(chat: Chat, kickUser: User) {
    const chatuser = await this.chatUserRepository.findByBoth(chat, kickUser);
    await this.chatUserRepository.deleteChatUser(chatuser);
    await this.chatRepository.updateCount(chat.id, chat.count - 1);
  }
}
