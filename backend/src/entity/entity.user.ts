import { NotEquals } from "class-validator";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@NotEquals(null)
	user_id: number;

	@Column()
	@NotEquals(null)
	username: string;

	@Column()
	email: string;
}

@Entity()
export class Record {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@NotEquals(null)
	user1Id: number;

	@Column()
	@NotEquals(null)
	user2Id: number;

	@Column()
	@NotEquals(null)
	user1Score: number;

	@Column()
	@NotEquals(null)
	user2Score: number;

	@Column()
	@NotEquals(null)
	date: Date;
}
