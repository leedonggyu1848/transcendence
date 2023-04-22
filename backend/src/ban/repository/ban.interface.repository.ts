import { Ban } from 'src/entity/ban.entity';
import { Chat } from 'src/entity/chat.entity';

export interface IBanRepository {
  addBanUser(chat: Chat, userName: string);
  deleteBanUser(banUser: Ban);
}
