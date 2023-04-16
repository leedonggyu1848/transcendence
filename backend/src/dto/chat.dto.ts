import { ChatType } from 'src/entity/common.enum';

export class ChatDto {
  title: string;
  type: ChatType;
  password: string;
  operator: string;
  count: number;
}
