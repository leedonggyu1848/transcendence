import { NotEquals } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

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
  count: number;

  @OneToMany(() => User, (user) => user.id, { cascade: true })
  players: User[];

  @OneToMany(() => User, (user) => user.id, { cascade: true })
  users: User[];
}
