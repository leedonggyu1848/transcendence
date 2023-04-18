import { ChatDto } from 'src/dto/chat.dto';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Users } from 'src/entity/user.entity';

export interface IChatUserRepository {
  addChatUser(chat: Chat, user: Users);
  findByChat(chat: Chat);
  findByChatWithJoin(chat: Chat);
  findByUser(user: Users);
  findByUserWithJoin(user: Users);
  findByBoth(chat: Chat, user: Users);
  findByBothWithJoin(chat: Chat, user: Users);
  deleteChatUser(chatUser: ChatUser);
}
