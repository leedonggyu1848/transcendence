import { Chat } from 'src/entity/chat.entity';

export interface IBanRepository {
  addBanUser(chat: Chat, username: string);
  deleteBanUser(id: number);
}
