import { FriendReqType } from 'src/entity/common.enum';
import { Users } from 'src/entity/user.entity';

export interface IFriendRepository {
  userToFriendDto(user: Users, time: Date, type: FriendReqType);

  addFriend(user: Users, friendname: string);

  // testcode -> TODO: delete
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

  deleteRequest(id: number);
}
