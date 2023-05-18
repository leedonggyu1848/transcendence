import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    example: '999999',
    description: '유저 고유 번호',
  })
  userId: number;
  @ApiProperty({
    example: 'abc',
    description: '유저의 이름',
  })
  userName: string;
  @ApiProperty({
    example: '999999-11111.png',
    description: '유저의 프로필 사진 이름',
  })
  profile: string;
  @ApiProperty({
    example: 'hello',
    description: '유저의 자기소개',
  })
  introduce: string;
  @ApiProperty({
    example: '0',
    description: '일반게임 이긴 횟수',
  })
  normalWin: number;
  @ApiProperty({
    example: '0',
    description: '일반게임 진 횟수',
  })
  normalLose: number;
  @ApiProperty({
    example: '0',
    description: '랭크게임 이긴 횟수',
  })
  rankWin: number;
  @ApiProperty({
    example: '0',
    description: '랭크게임 진 횟수',
  })
  rankLose: number;
}
