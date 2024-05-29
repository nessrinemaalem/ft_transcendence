import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Game } from '../games/games.entity';

@Entity({ name: 'games_history' })
export class GameHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id' })
  game_id: number;

  @Column({ name: 'player_1_id' })
  player_1_id: number;

  @Column({ name: 'player_2_id', nullable: true })
  player_2_id: number | null;

  @Column({ default: 0 })
  status: number;  // 0 = EN ATTENTE, 1 = EN COURS, 2 = TERMINÉ

  @Column({ default: 0 })
  is_mode_spectator: number // 0 = NO, 1 = YES,

  @Column({ default: 4 })
  max_scores: number

  @Column({ default: 0 })
  is_invited: number // 0 = NO, 1 = YES,

  @Column({ default: 0 })
  is_give_up: number // 0 = NO, 1 = YES,

  @Column({ default: 0 })
  is_ai: number // 0 = NO, 1 = YES,

  @Column({ default: 4 })
  mode: number // 4 = Turttle, 10 = Rabbit,

  @Column({ nullable: true })
  winner_id: number | null; // ID du gagnant, null par défaut

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => Game, { eager: true })
  @JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
  game: Game;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'player_1_id', referencedColumnName: 'id' })
  player_1: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'player_2_id', referencedColumnName: 'id' })
  player_2: User;
}
