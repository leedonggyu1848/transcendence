import { ApiProperty } from '@nestjs/swagger';
import { GameType } from 'src/entity/common.enum';

export class RecordDto {
  @ApiProperty({
    example: '999999',
    description: 'recode id',
  })
  id: number;
  @ApiProperty({
    example: 'NORMAL',
    description: '게임 타입',
  })
  gameType: GameType;
  @ApiProperty({
    example: '999999',
    description: '이긴 유저',
  })
  winner: string;
  @ApiProperty({
    example: '999999',
    description: '진 유저',
  })
  loser: string;
  @ApiProperty({
    example: '',
    description: '게임 시각',
  })
  time: Date;
}
