import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { ChatChannel } from '../chat-channels/chat-channels.entity';

@Entity({ name: 'chat_messages' })
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_from_id' })
  user_from_id: number;

  @Column({ name: 'user_to_id', nullable: true, default: 0  })
  user_to_id: number;

  @Column({ name: 'channel_to_id', nullable: true, default: 0 })
  channel_to_id: number;

  @Column()
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_from_id', referencedColumnName: 'id' })
  user_from: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_to_id', referencedColumnName: 'id' })
  user_to: User;

  @ManyToOne(() => ChatChannel, { eager: true })
  @JoinColumn({ name: 'channel_to_id', referencedColumnName: 'id' })
  channel_to: ChatChannel;
}
