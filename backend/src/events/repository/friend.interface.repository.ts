import { FriendReqType } from 'src/entity/common.enum';
import { Friend } from 'src/entity/friend.entity';
import { User } from 'src/entity/user.entity';

export interface IFriendRepository {
  userToFriendDto(user: User, time: Date, type: FriendReqType);
  addFriend(user: User, friend: User, accept: boolean);
  // testcode -> TODO: delete
  addDummyFriend(user: User, friendname: string);
  findAll(user: User);
  findAllWithJoin(user: User);
  findFriends(user: User);
  findFriendsWithJoin(user: User);
  findFriendRequested(username: string);
  findFriendRequestedWithJoin(username: string);
  updateAccept(id: number, accept: boolean);
  deleteFriend(friend: Friend);
}
