import { NotEquals } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Game {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@NotEquals(null)
	title: string;

	@Column()
	@NotEquals(null)
	interrupt_mode: boolean;

	@Column()
	@NotEquals(null)
	private_mode: boolean;

	@Column()
	@NotEquals(null)
	password: string;

	@Column()
	@NotEquals(null)
	playing: boolean;

	@OneToMany(() => User, (user) => user.id)
	players: User[];

	@OneToMany(() => User, (user) => user.id)
	users: User[];
}
