export interface UserDto {
  user_id: number;
  intra_id: string;
  profile: string;
  introduce: string;
  normal_win: number;
  normal_lose: number;
  rank_win: number;
  rank_lose: number;
  join_game: GameDto;
}

export interface GameDto {
  title: string;
  interrupt_mode: boolean;
  private_mode: boolean;
  cur: number;
}

export interface JoinnedUserDto {
  name: string;
  type: string;
}

export interface ChatListDto {
  title: string;
  private_mode: boolean;
  cur: number;
}

export interface JoinListDto {
  title: string;
  private_mode: boolean;
  newMessage: number;
}
