import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/entity/chat.entity';
import { Repository } from 'typeorm';

export class ChatRepository {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}
}
