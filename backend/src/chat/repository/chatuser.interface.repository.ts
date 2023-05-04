import { ChatDto } from 'src/dto/chat.dto';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { User } from 'src/entity/user.entity';

export interface IChatUserRepository {
  addChatUser(chat: Chat, user: User);
  findByChat(chat: Chat);
  findByChatWithJoin(chat: Chat);
  findByUser(user: User);
  findByUserWithJoin(user: User);
  findByBoth(chat: Chat, user: User);
  findByBothWithJoin(chat: Chat, user: User);
  deleteChatUser(chatUser: ChatUser);
}
