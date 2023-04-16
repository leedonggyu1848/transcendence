import { FriendReqType } from 'src/entity/common.enum';

export class FriendDto {
  intra_id: string;
  profile: string;
  time: Date;
  type: FriendReqType;
}
