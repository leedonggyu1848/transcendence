import { UserDto } from "./user.dto";

export class GameDto {
	title: string;
	interupt_mode: boolean;
	private_mode: boolean;
	password: string;
	playing: boolean;
	players: string[];
	users: string[];
}
