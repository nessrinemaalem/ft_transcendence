import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { ChatChannel } from '../chat-channels/chat-channels.entity'; // Assurez-vous d'importer correctement l'entité ChatChannel

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ default: 0 })
  status: number; // 0 = offline 1 = online 

  @Column({ unique: true })
  email: string;

  @Column({ length: 255, nullable: true })
  confirmation_url: string | null;

  @Column({ length: 128 })
  password: string;

  @Column({ nullable: true })
  folder: string | null;

  @Column({ nullable: true })
  avatar: string | null;
  
  @Column({ default: 0 })
  is_2fa: number;

  @Column({ nullable: true  })
  is_2fa_code: string | null;

  @Column({ nullable: true  })
  socket_id: string | null;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => ChatChannel, chatChannel => chatChannel.owner, { cascade: true })
  channels: ChatChannel[];

  @ManyToMany(() => ChatChannel, channel => channel.administrators)
  @JoinTable() 
  administered_channels: ChatChannel[];

  @ManyToMany(() => ChatChannel, channel => channel.members)
  @JoinTable() 
  member_channels: ChatChannel[];
}

