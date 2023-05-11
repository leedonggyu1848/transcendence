import { InjectRepository } from '@nestjs/typeorm';
import { ChatDto } from 'src/dto/chat.dto';
import { Chat } from 'src/entity/chat.entity';
import { ChatType } from 'src/entity/common.enum';
import { Repository } from 'typeorm';
import { IChatRepository } from './chat.interface.repository';

export class ChatRepository implements IChatRepository {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}

  async createByChatDto(chatDto: ChatDto, password: string) {
    const chat = this.chatRepository.create({ ...chatDto, password: password });
    await this.chatRepository.save(chat);
    return chat;
  }

  async findAll() {
    return await this.chatRepository.find();
  }

  async findByTitle(title: string) {
    return await this.chatRepository.findOneBy({ title: title });
  }

  async findByTitleWithJoin(title: string) {
    return await this.chatRepository.findOne({
      where: { title: title },
      relations: ['users', 'users.user', 'banUsers', 'administrators'],
    });
  }

  async updateType(chat: Chat, type: ChatType) {
    await this.chatRepository.update(chat.id, { type: type });
  }

  async updatePassword(chat: Chat, password: string) {
    const data = this.chatRepository.create({ ...chat });
    data.password = password;
    await this.chatRepository.save(data);
  }

  async updateOwner(chat: Chat, owner: string) {
    await this.chatRepository.update(chat.id, { owner: owner });
  }

  async updateCount(chat: Chat, count: number) {
    await this.chatRepository.update(chat.id, { count: count });
  }

  async deleteChat(chat: Chat) {
    await this.chatRepository.remove(chat);
  }
}
