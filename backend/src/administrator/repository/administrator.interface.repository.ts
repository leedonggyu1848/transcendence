import { Administrator } from 'src/entity/administrator.entity';
import { Chat } from 'src/entity/chat.entity';
import { User } from 'src/entity/user.entity';

export interface IAdministratorRepository {
  addAdministrator(chat: Chat, user: User);
  findAll();
  deleteAdministrator(admin: Administrator);
}
