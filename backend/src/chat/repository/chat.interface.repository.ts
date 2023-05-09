import { Chat } from 'src/entity/chat.entity';
import { ChatDto } from 'src/dto/chat.dto';

export interface IChatRepository {
  createByChatDto(chatDto: ChatDto, password: string);
  findAll();
  findByTitle(title: string);
  findByTitleWithJoin(title: string);
  updatePassword(chat: Chat, password: string);
  updateOwner(chatId: number, owner: string);
  updateCount(chatId: number, count: number);
  deleteChat(chat: Chat);
}
