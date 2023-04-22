import { FriendReqType } from 'src/entity/common.enum';

export class FriendDto {
  userName: string;
  profile: string;
  time: Date;
  type: FriendReqType;
}
