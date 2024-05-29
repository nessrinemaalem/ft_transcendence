import { WebSocketGateway, 
  OnGatewayConnection, OnGatewayDisconnect, 
  SubscribeMessage,
  WebSocketServer } from '@nestjs/websockets';
import { Server, Socket, } from 'socket.io';
import { GameService } from '../games/games.service';
import { GameHistoryService } from '../games-history/games-history.service';

import { GamePong } from '../games/game-pong/GamePong';
import { UserService } from 'src/users/users.service';
import { FriendService } from 'src/friends/friends.service';
import { ChatChannelService } from 'src/chat-channels/chat-channels.service';
import { ChatMessageService } from 'src/chat-messages/chat-messages.service';
import { ChatBlockService } from 'src/chat-blocks/chat-blocks.service'; 


@WebSocketGateway({
  cors: { origin: '*' }
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect 
{
  @WebSocketServer() 
  server: Server;

  games: Map<string, GamePong> = new Map();


  constructor(
    private readonly userService: UserService,
    private readonly gameService: GameService,
    private readonly gameHistoryService: GameHistoryService, 
    private readonly friendService: FriendService,
    private readonly chatChannelService: ChatChannelService,
    private readonly chatMessageService: ChatMessageService,
    private readonly chatBlockService: ChatBlockService,
  ){}


  getServer(): Server {
    return this.server;
  }

  getClientById(socketId: string): Socket | undefined 
  {
    return this.server.sockets.sockets.get(socketId);
  }

  getGames(): Map<string, GamePong> {
    return this.games; // Retourner la liste des jeux
  }


  handleConnection(socket: Socket) {
    const token = (socket.handshake as any).auth.token;
    const ipAddress = socket.handshake.address; // Obtenez l'adresse IP du client
    const userAgent = socket.handshake.headers['user-agent']; // Obtenez l'user-agent du client
    console.log(`Game Client connected: ${socket.id}, token: ${token}, IP: ${ipAddress}, User-Agent: ${userAgent}`);
  }

  async handleDisconnect(socket: Socket) 
  {
    console.log(`Game Client disconnected: ${socket.id}`);
    
    const rooms = socket.rooms;
    rooms.forEach(roomId => {
      console.log(`Removing client from room ${roomId}`);
      socket.leave(roomId);
    });
    try
    {
      await this.userService.deleteSocketId(socket.id) 
    }
    catch (error) {
    
    }
}

  // -- USER --

  @SubscribeMessage('u-join')
  async userHandleJoin(client: Socket, data: any) 
  {
    console.log('User join ...')
    if (data && data.user)
    {
      const roomId = 'ru-' + data.user.id
      console.log(`User Client ${client.id} joined room: ${roomId}`);
      client.join(roomId);
      await this.userService.updateSocketId(data.user.id, client.id)
      return data.roomId; 
    }
  }

  @SubscribeMessage('u-user-stat')
  async userHandleUserStat(client: Socket, data: any) 
  {
    console.log('User user stat ...')
    if (data && data.user)
    {
      const userHistory = await this.gameHistoryService.userHistory(data.user.id)
      const userInfoTotal = await this.gameHistoryService.userInfoTotal(data.user.id)
      const userInfoWek = await this.gameHistoryService.userInfoWeek(data.user.id)
      const roomId = 'ru-' + data.user.id
      this.getServer().to(roomId).emit('u-user-stat', {
        ...data,
        history: userHistory,
        info: {
          total: userInfoTotal,
          week: userInfoWek,
        }
      })
    }
  }

  // -- GAME --

  @SubscribeMessage('g-join')
  async handleJoinGame(client: Socket, data: any) 
  {
    console.log('Game join ...')
    if (data.game_history 
      && data.user 
      && (data.game_history.player_1_id === data.user.id 
        || data.game_history.player_2_id === data.user.id))
    { 
      const roomId = 'rg-' + data.game_history.id
      console.log(`Game Client ${client.id} Game joined room: ${roomId}`);
      client.join(roomId);

      if (!this.getGames().has(roomId))
      {
        // new game
        this.getGames().set(roomId, new GamePong({
          options: {
            ballSpeed: data.game_history.mode,
            score: {
              max: data.game_history.max_scores,
            },
            isPlayer2Ready: data.game_history.is_ai ? true : false,
          },
          onUpdate: (data: any) => {
            //console.log('on update ...')
            this.getServer().volatile.to(roomId).emit('g-games-game-play', data)
          }
        })); 
      }
      const game = this.getGames().get(roomId);
      // if (data.game_history.player_1_id === data.user.id)
      // {
      //   game.setDataPlayer1({
      //     isPlayer1Ready: data.game_history.player_1_id === data.user.id,
      //   })
        
      // }
      // else if (data.game_history.player_2_id === data.user.id)
      // {
      //   game.setDataPlayer2({
      //     isPlayer2Ready: data.game_history.player_2_id === data.user.id,
      //   })
      // }

      // prepareer game
      await this.handleGamesGame(client, data)

      return data.roomId; 
    } 

    if (data.game_history 
      && data.game_history.is_mode_spectator)
    {
      const roomId = 'rg-' + data.game_history.id
      console.log(`Game Client ${client.id} Game spectator joined room: ${roomId}`);
      client.join(roomId);

      await this.handleGamesGame(client, data)

      return data.roomId;       
    }
  }

  @SubscribeMessage('g-leave')
  async handleLeaveGame(client: Socket, data: any) 
  {
    console.log('Game leave ...')
    const { game_history, } = data
    const roomId = 'rg-' + game_history.id;
    console.log(`Game Client ${client.id} Game leaved room: ${roomId}`);
    client.leave(roomId);
    this.getServer().emit('g-leave', {  });
    return roomId;
  }

  @SubscribeMessage('g-games')
  async handleGames(client: Socket, { }: { }) {
    console.log(`Game Client ${client.id} sent all games list`);
    const games = await this.gameHistoryService.findAllViewable() 
    this.getServer().emit('g-games', { games: games });
  }

  @SubscribeMessage('g-games-game')
  async handleGamesGame(client: Socket, data: any) 
  {
    console.log(`handleGamesGame ...`);

    if (data && data.game_history)
    {
      const { game_history, } = data
      const roomId = 'rg-' + game_history.id;
      console.log(`Game Client ${client.id} Games Game room: ${roomId}`);
      this.getServer().to(roomId).emit('g-games-game', { game_history: game_history });
    }
    else if (data && data.user)
    {
      const { user, } = data
      // recuperer le game en cour ou en recherche
      const game_history = await this.gameHistoryService.findPlayerGameCurrent(user.id)
      if (game_history)
      {
        const roomId = 'rg-' + game_history.id;
        console.log(` ${client.id} Joining room ${roomId}`);
        await this.handleJoinGame(client, { game_history: game_history, user: data.user }) 
      } 
    }
  }

  @SubscribeMessage('g-games-game-play')
  async handleGamesGamePlay(client: Socket, data: { 
    game_history: any,
    game_data: any, 
    user: any, 
  }) 
  { 
    console.log(`handleGamesGamePlay ...`);

    if (!data || !data.game_history)
      return 

    const { game_history, } = data
    const roomId = 'rg-' + game_history.id; 
    console.log(`Game Client ${client.id} Games Game Play room: ${roomId}`);
  
    const game = this.getGames().get(roomId);
    if (game)
    {
      if (data.game_data)
      {
        //console.log('key', data, data.game_history)
        const { player1, player2 } = data.game_data
        game.setDataPlayer1(player1)
        game.setDataPlayer2(player2)
        game.tryPaddleMovement({ player1: player1, player2: player2 })
      }
 
      if (data.game_data 
          && (data.game_data.isEnd || data.game_data.is_give_up))
      {
        console.log('give up or end ...')
        game.stop()

        await this.gameHistoryService.updateEnd(game_history.id, data.game_data)
        const game_data = game.getData()
        this.games.delete(roomId)
        await this.handleLeaveGame(client, {
          ...data,
          game_data: {
            ...game_data,
            is_give_up: data.game_data.is_give_up,
          }
        })
        await this.handleGames(client, {})
        await this.userHandleUserStat(client, data)
        return ;
      }

      // debut du jeu si ca na pas commence
      game.start()
    }
    else
    {
      //console.log('key leave ???', game, roomId)
      //await this.handleLeaveGame(client, data) 
    }
  }
  
  // --

  // -- FRIENDS

  @SubscribeMessage('friends')
  async handleFriends(client: Socket, data: any) 
  {
    let roomId = ''
    let user_id = 0
    if (data.user)
      user_id = data.user.id
    else if (data.user_id)
      user_id = data.user_id  
    roomId = 'ru-' + user_id  
    console.log(`Client ${client.id} room: ${roomId} sent friends list`);   
    try {
      const friends = await this.friendService.findAll(user_id);
      this.server.to(roomId).emit('friends', { friends: friends });
    } catch (error) {
      console.log(error)
    }
  }

  async handleControllerFriends({ userId, }: { userId: number }) 
  {
    const roomId = 'ru-' + userId
    console.log(`Sending friends to room ${roomId}`);

    try {
      const friends = await this.friendService.findAll(userId);
      //console.log(friends)
      this.server.to(roomId).emit('friends', { friends: friends });
    } catch (error) {
    }
  }

  // --

  // -- CHAT

  @SubscribeMessage('c-channels-join')
  async handleChannelsJoin(client: Socket, data: any) 
  {   
    if (!data || !data.channel)
      return 

    const roomId = 'rc-' + data.channel.id
    console.log(`W CHANNELS JOIN  ${client.id} Channel joined room: ${roomId}`);
    client.join(roomId); // channel room 

    client.emit('c-channels-join', data)

    return roomId;
  }

  @SubscribeMessage('c-channels-leave')
  async handleLChannelsLeave(client: Socket, data: any) 
  {
    if (!data || !data.channel)
      return 

    const roomId = 'rc-' + data.channel.id
    console.log(`W CHANNELS LEAVE ${client.id} leaved room: ${roomId}`);
    client.leave(roomId);

    client.emit('c-channels-leave', data)

    return roomId;
  }

  @SubscribeMessage('c-channels')
  async handleChannels(client: Socket, { }: { }) {
    console.log(`WC Client ${client.id} sent all channels list`);
    try {
      const channels = await this.chatChannelService.findAllWithStats();
      //console.log(channels)
      this.server.emit('c-channels', { channels: channels });
    } catch (error) {
    } 
  }

  @SubscribeMessage('c-messages-channel')
  async handleMessagesChannel(client: Socket, data: any) 
  {
    console.log(`WC Client ${client.id} send messages channel`);
    
    if (data.channel.id)
    {
      const messages = await this.chatMessageService
        .findMessagesForChannel(data.channel.id);
      const roomId = 'rc-' + data.channel.id
      this.server.to(roomId).emit('c-messages-channel', { messages: messages });
      //client.emit('c-messages-channel', { messages: messages });
    }
  }

  @SubscribeMessage('c-messages-user')
  async handleMessagesUser(client: Socket, data: any)  
  {
    console.log(`WC Client ${client.id} send messages user`, data);
  
    if (data.user_id)
    {
      const messages = await this.chatMessageService
        .findAllUserMessagesNotChannels(data.user_id);
      const roomId = 'ru-' + data.user_id
      console.log(`messages user`, messages.length);
      //this.server.to(roomId).emit('c-messages-user', { messages: messages });
      client.emit('c-messages-user', { messages: messages });
    }
  }
 
  // Méthode distincte pour gérer l'envoi d'amis depuis le contrôleur
  
  async handleControllerChannelsJoin(channelId: any, userId: any) 
  {
    // envoyer a tous
    console.log(`handleControllerChannelsJoin ...`, channelId, userId);

    try {
      const channel = await this.chatChannelService.findChannelUserById(channelId, userId)
      const user = await this.userService.findById(userId)
      const client = this.getClientById(user.socket_id)
      if (client)
      {
        await this.handleChannelsJoin(client, { channel })
        await this.handleMessagesChannel(client, { channel  })
      }

      const channels = await this.chatChannelService.findAllWithStats();
      this.server.emit('c-channels', { channels: channels });
    } catch (error) {
    }
  } 

  async handleControllerChannels() {

    // envoyer a tous
    console.log(`handleControllerChannels ...`);

    try {
      const channels = await this.chatChannelService.findAllWithStats();
      //console.log(channels)
      this.server.emit('c-channels', { channels: channels });
    } catch (error) {
    }
  } 

  async handleControllerChannelsChannel(channelId: any) 
  {
    console.log(`handleControllerChannelsChannel ...`); 
    const messages = await this.chatMessageService.findMessagesForChannel(channelId);
    const roomId = 'rc-' + channelId
    this.server.to(roomId).emit('c-messages-channel', { messages: messages });
  } 

  async handleControllerChannelsChannelAdmin(channelId: any, userId: any) 
  {
    console.log(`handleControllerChannelsChannelAdmin ...`); 
    const channel = await this.chatChannelService.findChannelUserById(channelId, userId)
    const user = await this.userService.findById(userId)
    const client = this.getClientById(user.socket_id)
    if (client)
    {
      await this.handleChannelsJoin(client, { channel })
    }
    const messages = await this.chatMessageService.findMessagesForChannel(channelId);
    const roomId = 'rc-' + channelId
    this.server.to(roomId).emit('c-messages-channel', { messages: messages });
  } 

  async handleControllerChannelsChannelLeaveKickBan(channelId: any, userId: any) 
  {
    // envoyer a tous
    console.log(`handleControllerChannelsChannelLeaveKickBan ...`, channelId, userId);

    try {

      const channel = await this.chatChannelService.findById(channelId)
      const user = await this.userService.findById(userId)
      const client = this.getClientById(user.socket_id)
      await this.handleLChannelsLeave(client, { channel: channel }) 

      // actualiser channels a tous
      const channels = await this.chatChannelService.findAllWithStats();
      this.server.emit('c-channels', { channels: channels });
      // messages du channel
      const messages = await this.chatMessageService.findMessagesForChannel(channelId);
      const roomId = 'rc-' + channelId
      this.server.to(roomId).emit('c-messages-channel', { messages: messages });
    } catch (error) 
    {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages for the channel');
    }
  }

  async handleControllerMessages(channel_message: any)
  {
    // envoyer a tous concerne
    console.log(`handleControllerMessages ...`);

    if (channel_message.channel_to_id) 
    {
      const messages = await this.chatMessageService
        .findMessagesForChannel(channel_message.channel_to_id);
      const roomId = 'rc-' + channel_message.channel_to_id
      this.server.to(roomId).emit('c-messages-channel', { messages: messages });
      return 
    }

    if (channel_message.user_from_id)
    {
      console.log('send to user user_from_id ...', channel_message.user_from_id)
      const messages = await this.chatMessageService.findAllForUserNotBlocked(channel_message.user_from_id);
      const roomId = 'ru-' + channel_message.user_from_id
      console.log('send to user user_from_id ...', messages.length)
      this.server.to(roomId).emit('c-messages-user', { messages: messages });
    }

    if (channel_message.user_to_id)
    {
      console.log('send to user user_to_id ...', channel_message.user_to_id)
      const messages = await this.chatMessageService.findAllForUserNotBlocked(channel_message.user_to_id);
      const roomId = 'ru-' + channel_message.user_to_id
      console.log('send to user user_to_id ...', messages.length)
      this.server.to(roomId).emit('c-messages-user', { messages: messages });
    }
  }

  async handleControllerMessagesBlock(user_block: any)
  {
    // envoyer a tous concerne
    console.log(`WC Sending channels to channel and users block`, user_block);

    if (user_block.blocking_user_id)
    {
      console.log('send to user blocking_user_id ...', user_block.blocking_user_id)
      const messages = await this.chatMessageService.findAllForUserNotBlocked(user_block.blocking_user_id);
      const roomId = 'ru-' + user_block.blocking_user_id
      console.log('send to user blocking_user_id ...', messages.length)
      this.server.to(roomId).emit('c-messages-user', { messages: messages });
    }

    if (user_block.blocked_user_id)
    {
      console.log('send to user blocked_user_id ...', user_block.blocked_user_id)
      const messages = await this.chatMessageService.findAllForUserNotBlocked(user_block.blocked_user_id);
      const roomId = 'ru-' + user_block.blocked_user_id
      console.log('send to user blocked_user_id ...', messages.length)
      this.server.to(roomId).emit('c-messages-user', { messages: messages });
    }
  }

  // -- 

  // -- CHAT BLOCK

  @SubscribeMessage('c-users-blocked')
  async handleMessagesUsersBlock(client: Socket, data: any) 
  {
    console.log(`WC Client ${client.id} send messages block`, data);
    
    if (data.user_id)
    {
      console.log('send to users blocks ...', data.user_id)
      const users_blocked = await this.chatBlockService.findAllUBlockinUser(data.user_id);
      const roomId = 'ru-' + data.user_id
      console.log('send to user blocks ...', users_blocked.length)
      this.server.to(roomId).emit('c-users-blocked', { users_blocked: users_blocked });
    }
  }

  async handleControllerUsersBlock(user_block: any)
  {
    // envoyer a tous concerne
    console.log(`WC Sending channels to channel and users block`, user_block);
    if (user_block.blocked_user_id)
    {
      console.log('send to users blocks ...', user_block.blocking_user_id)
      const users_blocked = await this.chatBlockService.findAllUBlockinUser(user_block.blocking_user_id);
      const roomId = 'ru-' + user_block.blocking_user_id
      console.log('send to user blocks ...', users_blocked.length)
      this.server.to(roomId).emit('c-users-blocked', { users_blocked: users_blocked });
    }
  }


  async handleControllerSignOut(userId: any)
  {
    // envoyer a concerne
    console.log(`handleControllerSignOut ...`, userId);

  }

}
