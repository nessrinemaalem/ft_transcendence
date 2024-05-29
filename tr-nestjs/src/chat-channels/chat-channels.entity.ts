// https://orkhan.gitbook.io/typeorm/docs/many-to-many-relations
// https://blog.continium-labs.com/many-to-many-relations-with-typeorm-and-nestjs/

import { 
  Entity, Column, PrimaryGeneratedColumn, 
  ManyToOne, ManyToMany, JoinTable, JoinColumn,
  PrimaryColumn
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity({ name: 'chat_channels' })
export class ChatChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number; 

  @Column({ unique: true, })
  name: string;

  @Column({ nullable: true })
  password: string | null;

  @Column({ default: 0 })
  privacy: number; // 0 = public, 1 = private, 2 = protected

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User; 

  @ManyToMany(() => User, user => user.administered_channels, { cascade: true })
  @JoinTable({
    name: 'chat_channels_administrators',
    joinColumn: {
      name: 'chat_channel_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      //referencedColumnName: 'id',
    },
  })
  administrators?: User[];

  @ManyToMany(() => User, user => user.member_channels, { cascade: true })
  @JoinTable({
    name: 'chat_channels_members',
    joinColumn: {
      name: 'chat_channel_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  members?: User[];
}

@Entity({ name: 'chat_channels_administrators' })
export class ChatChannelAdministrator {
  @PrimaryColumn({ name: 'chat_channel_id' })
  chat_channel_id: number;

  @PrimaryColumn({ name: 'user_id' })
  user_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => ChatChannel, {  })
  @JoinColumn({ name: 'chat_channel_id', referencedColumnName: 'id' })
  chat_channels: ChatChannel[];

  @ManyToOne(() => User, { })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id'  })
  administrators: User[];
}

@Entity({ name: 'chat_channels_members' })
export class ChatChannelMember {
  @PrimaryColumn()
  chat_channel_id: number;

  @PrimaryColumn()
  user_id: number;

  @Column({ default: 0 })
  is_banned: number // default 0 ou 1

  @Column({ default: 0 })
  is_muted: number // default 0 ou 1

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => ChatChannel, {  })
  @JoinColumn({ name: 'chat_channel_id' })
  chat_channel: ChatChannel;

  @ManyToOne(() => User, { })
  @JoinColumn({ name: 'user_id' })
  user: User; 
}

