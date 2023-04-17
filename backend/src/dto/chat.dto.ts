import { ChatType } from 'src/entity/common.enum';

export class ChatDto {
  title: string;
  type: ChatType;
  operator: string;
  count: number;
}
