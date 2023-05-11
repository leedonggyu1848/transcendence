import { Chat } from 'src/entity/chat.entity';
import { ChatDto } from 'src/dto/chat.dto';
import { ChatType } from 'src/entity/common.enum';

export interface IChatRepository {
  createByChatDto(chatDto: ChatDto, password: string);
  findAll();
  findByTitle(title: string);
  findByTitleWithJoin(title: string);
  updateType(chat: Chat, type: ChatType);
  updatePassword(chat: Chat, password: string);
  updateOwner(chat: Chat, owner: string);
  updateCount(chat: Chat, count: number);
  deleteChat(chat: Chat);
}
