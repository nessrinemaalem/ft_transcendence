import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity({ name: 'friends' })
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_1_id' })
  user_1_id: number;

  @Column({ name: 'user_2_id' })
  user_2_id: number;

  @Column({ default: 0 })
  status: number; // 0 = en attente, 1 = accepté

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_1_id', referencedColumnName: 'id' })
  user_1: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_2_id', referencedColumnName: 'id' })
  user_2: User;
}
