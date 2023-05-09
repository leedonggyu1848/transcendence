import { Friend } from 'src/entity/friend.entity';
import { User } from 'src/entity/user.entity';

export interface IFriendRepository {
  addFriend(user: User, friend: User, accept: boolean);
  findAllByUser(user: User);
  findAllByUserWithJoin(user: User);
  findAllByFriend(friendName: string);
  findAllByFriendWithJoin(friendName: string);
  findFriends(user: User);
  findFriendsWithJoin(user: User);
  findFriendRequested(userName: string);
  findFriendRequestedWithJoin(userName: string);
  updateFriendName(id: number, userName: string);
  updateFriendProfile(id: number, profile: string);
  updateAccept(id: number, accept: boolean);
  deleteFriend(friend: Friend);
}
