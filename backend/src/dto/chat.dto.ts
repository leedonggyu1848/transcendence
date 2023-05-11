import { ChatType } from 'src/entity/common.enum';

export class ChatDto {
  title: string;
  type: ChatType;
  owner: number;
  count: number;
}
