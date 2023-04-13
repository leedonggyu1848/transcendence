import { Users } from 'src/entity/user.entity';

export interface IFriendRepository {
  addFriend(user: Users, friendname: string);

  addDummyFriend(user: Users, friendname: string);

  findAll(user: Users);

  findAllWithJoin(user: Users);

  findFriends(user: Users);

  findFriendsWithJoin(user: Users);

  findFriendRequests(user: Users);

  findFriendRequestsWithJoin(user: Users);

  findFriendRequested(username: string);

  findFriendRequestedWithJoin(username: string);

  updateAccept(id: number, accept: boolean);
}
