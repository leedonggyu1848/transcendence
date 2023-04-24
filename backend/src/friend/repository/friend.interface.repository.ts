import { FriendReqType } from 'src/entity/common.enum';
import { Friend } from 'src/entity/friend.entity';
import { User } from 'src/entity/user.entity';

export interface IFriendRepository {
  userToFriendDto(user: User, time: Date, type: FriendReqType);
  addFriend(user: User, friend: User, accept: boolean);
  findAll(user: User);
  findAllWithJoin(user: User);
  findFriends(user: User);
  findFriendsWithJoin(user: User);
  findFriendRequested(userName: string);
  findFriendRequestedWithJoin(userName: string);
  updateAccept(id: number, accept: boolean);
  deleteFriend(friend: Friend);
}
