import React from 'react'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faEllipsis, faTimes, } from '@fortawesome/free-solid-svg-icons'
import { setChannelsCurrent, setMessages, setMessagesUser, } from '../store/actions';
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'
import { Link } from 'react-router-dom';

interface BlockChatState
{
    toolsStyle: any
    toolsIsSelected: boolean
    messageCurent: any
    
    message: any
    username: any
}

interface BlockChatProps
{
    user: any
    channels_current: any
    messages: any
    messages_user: any
    game: any
    setChannelsCurrent: (data: any) => void
    setMessages: (data: any) => void
    setMessagesUser: (data: any) => void
}

class BlockChat extends React.Component<BlockChatProps, BlockChatState>
{
    refTools: any

    constructor(props: any)
    {
        super(props)
        this.state = {
            toolsStyle: {},
            toolsIsSelected: false,
            messageCurent: null,
            message: '',
            username: '',
        }

        this.refTools = React.createRef()

        SOCKET_ONCE._socket.on('c-messages-user', (data: any) => {
            console.log('socket messages user X ...', data)
            const sortedMessages = data.messages.sort((a: any, b: any) => {
                const dateA = new Date(a.updated_at).getTime();
                const dateB = new Date(b.updated_at).getTime();
                return dateA - dateB;
            });
            this.props.setMessagesUser(sortedMessages)
        });

        SOCKET_ONCE._socket.on('c-messages-channel', (data: any) => {
            console.log('socket messages channel ...', data)
            const sortedMessages = data.messages.sort((a: any, b: any) => {
                const dateA = new Date(a.updated_at).getTime();
                const dateB = new Date(b.updated_at).getTime();
                return dateA - dateB;
            });
            this.props.setMessages(sortedMessages)
        });

        SOCKET_ONCE._socket.on('c-leave-channel', (data: any) => {
            console.log('socket leave channel ...', data)
            if (data.user_id === this.props.user.id)
            {
                this.props.setMessages([])
                this.props.setChannelsCurrent(null)
                SOCKET_ONCE._socket.emit('c-leave-channel', { 
                    room_id: data.room_id,
                });
            }

        });

        // if deconnect & connect
        SOCKET_ONCE.onConnectChatMessages = () => {
            if (this.props.user)
            {
                SOCKET_ONCE._socket.emit('c-messages-user', { 
                    user_id: this.props.user.id,
                });
            }
        }
    }

    componentDidMount(): void 
    {
        console.log('BlockChat componentDidMount ...')

        if (this.props.user)
        {
            SOCKET_ONCE._socket.emit('c-messages-user', { 
                user_id: this.props.user.id,
            });
        }
    }

    componentDidUpdate(prevProps: Readonly<BlockChatProps>, prevState: Readonly<BlockChatState>, snapshot?: any): void 
    {
        console.log('BlockChat componentDidUpdate ...')
    }

    // -- HANLDER

    handleOnOptions(event: any, message: any)
    {
        const element = event.currentTarget
        const setPosition = (element: any, callback: (style: any) => void) => 
        {
            const objetRect = element.getBoundingClientRect() // button
            console.log(element, objetRect)

            const objectRectClient = this.refTools.current.getBoundingClientRect()
            
            console.log(window.innerWidth - objetRect.left < objetRect.width, window.innerWidth - objetRect.left)

            let right = 0

            if (objetRect.left > objectRectClient.width)
            {
                console.log('test', objetRect.left, objectRectClient.width)
                right = window.innerWidth - objetRect.left
            }
            else
            {
                console.log('test++', objetRect.left)
                right = window.innerWidth - (objectRectClient.width + objetRect.left + objetRect.width) 
            }
            
            const style = {
                display: 'block',
                top: objetRect.top + 'px',
                right: right + 'px',
            }

            callback(style)
        }

        this.setState({
            ...this.state,
            toolsIsSelected: true,
            messageCurent: message,
        }, () => setPosition(element, (style) => this.setState({
            ...this.state,
            toolsStyle: style,
        })))

    }

    handleBlockToolsOnClick()
    {
        this.setState({
            ...this.state,
            toolsIsSelected: false,
        })
    }


    handleLeaveOnClick(event: any)
    {
        event.preventDefault();
       
        const url = `/chat/channels/${this.props.channels_current.id}/leave`
        let postData = {
            user_id: this.props.user.id,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log('leave ...', data);
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleOnInvite(event: any)
    {
        let postData = {
            game_id: 1,
            player_1_id: this.props.user.id,
            player_2_id: this.state.messageCurent.user_from_id,
            mode: this.props.game.game_options ? this.props.game.game_options.mode : 4,
            is_mode_spectator: this.props.game.game_options ? this.props.game.game_options.is_mode_spectator : false,
            is_ai: 0,
            max_scores: this.props.game.game_options ? this.props.game.game_options.max_scores : 2,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch('/games-his/store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {
            console.log('g-games-game stored ...', data);
            
            SOCKET_ONCE._socket.emit('g-games', { });
            SOCKET_ONCE._socket.emit('g-games-game', { user: this.props.user });

            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleOnBlock(event: any)
    {
        event.preventDefault();
       
        const url = `/chat/blocks/store`
        let postData = {
            blocking_user_id: this.props.user.id,
            blocked_user_id: this.state.messageCurent.user_from_id,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log('block ...', data);
            // laveve previous if needed ...
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleOnKick(event: any)
    {
        event.preventDefault();
       
        const url = `/chat/channels/${this.props.channels_current.id}/members/kick`
        let postData = {
            user_id: this.state.messageCurent.user_from_id,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log('kick ...', data);
            //this.props.setChannelsCurrent(null)
    
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleOnBan(event: any)
    {
        event.preventDefault();
       
        const url = `/chat/channels/${this.props.channels_current.id}/members/ban`
        let postData = {
            user_id: this.state.messageCurent.user_from_id,
            is_banned: this.state.messageCurent.member.is_banned ? 0 : 1,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log('ban ...', data);
            // laveve previous if needed ...
            // if (data.member)
            // {
            //     this.props.setChannelsCurrent(null)
            //     SOCKET_ONCE._socket.emit('c-channels', { });
            // }
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleOnMute(event: any)
    {
        event.preventDefault();
       
        const url = `/chat/channels/${this.props.channels_current.id}/members/mute`
        let postData = {
            user_id: this.state.messageCurent.user_from_id,
            is_muted: this.state.messageCurent.member.is_muted ? 0 : 1,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log('mute ...', data);
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleOnAdmin(event: any)
    {
        event.preventDefault();
       
        const url = `/chat/channels/${this.props.channels_current.id}/admins/store`
        let postData = {
            owner_id: this.props.user.id,
            user_id: this.state.messageCurent.user_from_id,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log('admins ...', data);
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleOnAdminDestroy(event: any)
    {
        event.preventDefault();
       
        const url = `/chat/channels/${this.props.channels_current.id}/admins/destroy`
        let postData = {
            owner_id: this.props.user.id,
            admin_id: this.state.messageCurent.user_from_id,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log('admins ...', data);
      
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleInputChange = (event: any) => {
        const { name, value } = event.target;
        this.setState({
            ...this.state,
            [name]: value
        });
    };

    handleSubmit = (event: any) => 
    {
        event.preventDefault();

        const { username, message } = this.state;
        
        console.log('Username:', username);
        console.log('Message:', message);

        const url = `/chat/messages/store`
        let postData = {
            from_id: this.props.user.id,
            to_username: username,
            message: message,
            channel_id: this.props.channels_current ? this.props.channels_current.id : 0,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log('message sent ...', data);
           
            // other actions ...
            // ex: update vue

            // if (data.message_channel)
            //     SOCKET_ONCE._socket.emit('c-messages-channel', { channel_id: data.message_channel.channel_to_id });
            // else if (data.message_user)
            // {
            //     SOCKET_ONCE._socket.emit('c-messages-user', { user_id: data.message_user.user_from_id });
            //     SOCKET_ONCE._socket.emit('c-messages-user', { user_id: data.message_user.user_to_id });
            // }

            this.setState({
                ...this.state,
                username: '',
                message: ''
            });

        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    };

    // -- RENDER

    renderUsersMessages()
    {
        const elements =  []

        const messagesUser = this.props.messages_user.map((message: any) => {
            return {
                ...message,
                isDirect: true
            };
        });
        const allMessages = [...this.props.messages, ...messagesUser];

        const sortedAllMessages = allMessages.sort((a: any, b: any) => {
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();
            return  dateB - dateA; // dateA - dateB;
        });

        const formattedDate = (dateString: string) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à partir de 0
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
        
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        };

        const uniqueMessages = new Map();
        const formattedMessages = sortedAllMessages.reduce((uniqueArray: any[], message: any) => {
            if (!uniqueMessages.has(message.id)) {
                uniqueMessages.set(message.id, true);
                uniqueArray.push({
                    ...message,
                    updated_at: formattedDate(message.updated_at),
                });
            }
            return uniqueArray;
        }, []);


        for(let index = 0; index < formattedMessages.length; index++)
        {
            const userMessage = formattedMessages[index]

            let avatar = 'https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp'
            if (userMessage.user_from.avatar)
            {
                if (userMessage.user_from.avatar.startsWith('https://'))
                    avatar = userMessage.user_from.avatar
                else
                    avatar = '/' + userMessage.user_from.avatar
            }

            elements.push(
                <div className={ 'user-message' + (userMessage.isDirect ? ' is-direct' : '') } key={ index }>
                    <div className="m-block-left">
                    <Link to={'/user/' + userMessage.user_from.id} className="avatar">
                        <img src={ avatar }/>
                    </Link>
                    </div>
                    <div className="m-block-right">
                        <div className="date-tools">
                            <div className="date">{ userMessage.updated_at }</div>
                            { (this.props.user.id !== userMessage.user_from_id) &&
                               ( 
                                    <button onClick={ (event: any) => this.handleOnOptions(event, userMessage) }>
                                        <FontAwesomeIcon icon={ faEllipsis } />
                                    </button>
                               )
                            }
                        </div>
                        <div className="message">
                            {userMessage.message.split('\n').map((line: any, index: any) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }
        return elements
    }

    renderForm()
    {
        const { username, message } = this.state;

        return (
            <div className="block-form">
                <form className="form" onSubmit={this.handleSubmit}>
                    <div className="row">
                        <label htmlFor="">User</label>
                        <input type="text" name="username" id="username" placeholder="Name..." value={ username } onChange={this.handleInputChange} />
                    </div>
                    <div className="row message">                
                        <textarea name="message" id="message" maxLength={200} placeholder="..." 
                            value={ message } onChange={this.handleInputChange}></textarea>                        
                        <button>
                            <FontAwesomeIcon icon={ faPaperPlane } />
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    renderTools()
    {
        console.log('users losg', this.props.channels_current, this.state.messageCurent)

        const is_channel = this.state.messageCurent && this.state.messageCurent.channel_to_id
        const is_channel_administrator = is_channel && this.props.channels_current && this.props.channels_current.admin
        const is_channel_owner = is_channel && this.state.messageCurent.channel_to.owner_id === this.props.user.id

        return (
            <div className={ 'block-tools' + (this.state.toolsIsSelected ? ' selected' : '') }
                onClick={ () => this.handleBlockToolsOnClick() }>
                <div className="bt-container" style={ this.state.toolsStyle } ref={ this.refTools }>
                    <button onClick={ (event: any) => this.handleOnInvite(event) }>Invite Game</button>
                    
                    {this.state.messageCurent && this.state.messageCurent.channel_to_id === null && (
                        <button onClick={ (event: any) => this.handleOnBlock(event) }>Block User</button>
                    )}
                    {this.props.channels_current && (
                        (is_channel_administrator || is_channel_owner) && (
                            <>
                                <button onClick={ (event: any) => this.handleOnKick(event) }>Kick</button>
                                <button onClick={ (event: any) => this.handleOnBan(event) }>
                                    { this.state.messageCurent && this.state.messageCurent.member.is_banned ? 'Unban': 'Ban' }
                                </button>
                                <button onClick={ (event: any) => this.handleOnMute(event) }>
                                    { this.state.messageCurent && this.state.messageCurent.member.is_muted ? 'Unmute': 'Mute' }
                                </button>
                            </>
                        )
                    )}
                    {is_channel_owner
                        && this.state.messageCurent && !this.state.messageCurent.admin && (
                            <button onClick={ (event: any) => this.handleOnAdmin(event) }>+ Administrator</button>
                        )
                    }
                    {is_channel_owner
                        && this.state.messageCurent && this.state.messageCurent.admin && (
                            <button onClick={ (event: any) => this.handleOnAdminDestroy(event) }>- Administrator</button>
                        )
                    }
                </div>
            </div>
        )
    }

    render()
    {
        return (
            <>

                <div className="block-channel">
                    <div className="name">#{ !this.props.channels_current ? 'not-in-channel' : this.props.channels_current.name }</div>
                    {this.props.channels_current && (
                        <button onClick={ (event: any) => this.handleLeaveOnClick(event) }>LEAVE</button>
                    )}
                </div>

                <div className="block-mesages">
                    { this.renderUsersMessages() }
                </div>

                { this.renderForm() }

                { this.renderTools() }

            </>
        )
    }

}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
    game: state.game,
    channels_current: state.chat.channels_current,
    messages: state.chat.messages,
    messages_user: state.chat.messages_user,
});

const mapDispatchToProps = {
    setChannelsCurrent,
    setMessages,
    setMessagesUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(BlockChat);