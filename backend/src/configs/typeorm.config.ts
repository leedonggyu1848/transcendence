import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Record, User } from 'src/entity/entity.user';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'postgres',
  port: 5432,
  username: 'postgres',
  password: 'qwe123',
  database: 'transcendence',
  entities: [User, Record],
  synchronize: true,
};
