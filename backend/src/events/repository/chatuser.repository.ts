import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IChatUserRepository } from './chatuser.interface.repository';

export class ChatUserRepository implements IChatUserRepository {
  constructor(
    @InjectRepository(ChatUser)
    private chatUserRepository: Repository<ChatUser>,
  ) {}

  async addChatUser(chat: Chat, user: Users) {
    await this.chatUserRepository.save({
      chat: chat,
      user: user,
    });
  }

  async findByChat(chat: Chat) {
    return await this.chatUserRepository.findBy({ chat: { id: chat.id } });
  }

  async findByChatWithJoin(chat: Chat) {
    return await this.chatUserRepository.find({
      where: { chat: { id: chat.id } },
      relations: ['chat', 'user'],
    });
  }

  async findByUser(user: Users) {
    return await this.chatUserRepository.findBy({ user: { id: user.id } });
  }

  async findByUserWithJoin(user: Users) {
    return await this.chatUserRepository.find({
      where: { user: { id: user.id } },
      relations: ['chat', 'user'],
    });
  }

  async findByBoth(chat: Chat, user: Users) {
    return await this.chatUserRepository.findOneBy({
      chat: { id: chat.id },
      user: { id: user.id },
    });
  }

  async findByBothWithJoin(chat: Chat, user: Users) {
    return await this.chatUserRepository.findOne({
      where: { chat: { id: chat.id }, user: { id: user.id } },
      relations: ['chat', 'user'],
    });
  }

  async deleteChatUser(chatUser: ChatUser) {
    await this.chatUserRepository.remove(chatUser);
  }
}
