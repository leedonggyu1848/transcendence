import { InjectRepository } from '@nestjs/typeorm';
import { ChatDto } from 'src/dto/chat.dto';
import { Chat } from 'src/entity/chat.entity';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IChatRepository } from './chat.interface.repository';

export class ChatRepository implements IChatRepository {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}

  async createByChatDto(chatDto: ChatDto) {
    const chat = this.chatRepository.create({ ...chatDto });
    console.log(chat);
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
      relations: ['users', 'banUsers'],
    });
  }

  async updateOperator(chatId: number, operator: string) {
    await this.chatRepository.update(chatId, { operator: operator });
  }

  async updateCount(chatId: number, count: number) {
    await this.chatRepository.update(chatId, { count: count });
  }
}
