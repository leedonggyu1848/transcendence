import { InjectRepository } from '@nestjs/typeorm';
import { ChatDto } from 'src/dto/chat.dto';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

export class ChatRepository {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}

  async createByChatDto(chatDto: ChatDto, user: Users) {
    const chat = await this.chatRepository.create({
      title: chatDto.title,
      type: chatDto.type,
      password: chatDto.password,
      operator: chatDto.operator,
      count: chatDto.count,
      // banUsers: [],
    });
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
      relations: ['users'],
    });
  }
}
