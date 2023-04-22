import { Inject, Injectable } from '@nestjs/common';
import { IFriendRepository } from 'src/events/repository/friend.interface.repository';

@Injectable()
export class FriendService {
  constructor(
    @Inject('IFriendRepository')
    private friendRepository: IFriendRepository,
  ) {}
}
