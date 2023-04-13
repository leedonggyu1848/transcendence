import { NotEquals } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from './user.entity';

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

  @OneToMany(() => Users, (user) => user.play_game, { cascade: true })
  players: Users[];

  @OneToMany(() => Users, (user) => user.watch_game, { cascade: true })
  watchers: Users[];
}
