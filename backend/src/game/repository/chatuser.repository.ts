import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

export class ChatUserRepository {
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
    return await this.chatUserRepository.findBy({ chat: chat });
  }

  async findByChatWithJoin(chat: Chat) {
    return await this.chatUserRepository.find({
      where: { chat: chat },
      relations: ['chat', 'user'],
    });
  }

  async findByUser(user: Users) {
    return await this.chatUserRepository.findBy({ user: user });
  }

  async findByUserWithJoin(user: Users) {
    return await this.chatUserRepository.find({
      where: { user: user },
      relations: ['chat', 'user'],
    });
  }

  async findByBoth(chat: Chat, user: Users) {
    return await this.chatUserRepository.findBy({ chat: chat, user: user });
  }

  async findByBothWithJoin(chat: Chat, user: Users) {
    return await this.chatUserRepository.find({
      where: { chat: chat, user: user },
      relations: ['chat', 'user'],
    });
  }

  async deleteChatUser(id: number) {
    await this.chatUserRepository.delete(id);
  }
}
