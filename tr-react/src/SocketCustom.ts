import { io } from "socket.io-client";

class SocketCustom 
{
    _socket: any = null;
    
    onConnect: any
    onConnectUser: any
    onConnectGame: any
    onConnectGameCurrent: any
    onConnectChatChannels: any
    onConnectChatMessages: any
    onConnectChatBlock: any
    onConnectFriends: any


    onDisconnect: any
    onDisconnectChatChannels: any

    constructor() 
    {
        console.log('SocketCustom once ...');

        this._socket = io('http://localhost:8000', {
            auth: {
                token: 'votre_token_d_authentification',
                // Autres données d'authentification personnalisées si nécessaire
            },
        });

        this.handleConnection()
        this.handleDisconnection()
    }

    handleConnection()
    {
        this._socket.on('connect', () => {
            console.log('Connected to server');

            if (this.onConnect)
                this.onConnect()
            if (this.onConnectUser)
                this.onConnectUser()
            if (this.onConnectGame)
                this.onConnectGame()
            if (this.onConnectGameCurrent)
                this.onConnectGameCurrent()  
            if (this.onConnectChatChannels)
                this.onConnectChatChannels()
            if (this.onConnectChatMessages)
                this.onConnectChatMessages()
            if (this.onConnectChatBlock)
                this.onConnectChatBlock()
            if (this.onConnectFriends)
                this.onConnectFriends()
        });
    }

    handleDisconnection()
    {
        this._socket.on('disconnect', () => {
            console.log('Disconnected from server');

            if (this.onDisconnect)
                this.onDisconnect()
            if (this.onDisconnectChatChannels)
                this.onDisconnectChatChannels()
        });
    }
}

const SOCKET_ONCE = new SocketCustom();

export default SOCKET_ONCE;
