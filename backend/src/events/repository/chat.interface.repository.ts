import { ChatDto } from 'src/dto/chat.dto';
import { Users } from 'src/entity/user.entity';

export interface IChatRepository {
  createByChatDto(chatDto: ChatDto, user: Users);
  findAll();
  findByTitle(title: string);
  findByTitleWithJoin(title: string);
  updateOperator(chatId: number, operator: string);
  updateCount(chatId: number, count: number);
}
