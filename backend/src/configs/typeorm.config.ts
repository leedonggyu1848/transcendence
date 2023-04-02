import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Game } from "src/entity/game.entity";
import { User } from "src/entity/user.entity";

export const typeORMConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	host: 'postgres',
	port: 5432,
	username: 'postgres',
	password: 'qwe123',
	database: 'transcendence',
	entities: [User, Game],
	synchronize: true,
}
