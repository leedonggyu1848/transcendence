import { Users } from 'src/entity/user.entity';

export interface IFriendRepository {
  addFriend(user: Users, friendname: string);

  findAll(user: Users);

  findFriends(user: Users);

  findFriendRequests(user: Users);

  findFriendRequested(username: string);

  updateAccept(id: number, accept: boolean);
}
