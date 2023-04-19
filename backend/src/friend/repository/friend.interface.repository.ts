import { FriendReqType } from 'src/entity/common.enum';
import { Friend } from 'src/entity/friend.entity';
import { User } from 'src/entity/user.entity';

export interface IFriendRepository {
  userToFriendDto(user: User, time: Date, type: FriendReqType);
  addFriend(user: User, friendname: string);
  // testcode -> TODO: delete
  addDummyFriend(user: User, friendname: string);
  findAll(user: User);
  findAllWithJoin(user: User);
  findFriends(user: User);
  findFriendsWithJoin(user: User);
  findFriendRequests(user: User);
  findFriendRequestsWithJoin(user: User);
  findFriendRequested(username: string);
  findFriendRequestedWithJoin(username: string);
  updateAccept(id: number, accept: boolean);
  deleteRequest(friend: Friend);
}
