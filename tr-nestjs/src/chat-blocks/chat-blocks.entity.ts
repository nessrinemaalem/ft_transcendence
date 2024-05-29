import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity({ name: 'chat_blocks' })
export class ChatBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'blocking_user_id' })
  blocking_user_id: number;

  @Column({ name: 'blocked_user_id' })
  blocked_user_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'blocking_user_id', referencedColumnName: 'id' })
  blocking_user: User; // L'utilisateur qui bloque

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'blocked_user_id', referencedColumnName: 'id' })
  blocked_user: User; // L'utilisateur bloqué
}
