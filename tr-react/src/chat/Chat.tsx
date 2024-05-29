import React from 'react'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faEllipsis, faTimes, } from '@fortawesome/free-solid-svg-icons'
import { setChannels, setMessages, setMessagesUser, setBlocks } from '../store/actions';
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'

import BlockChat from './BlockChat'
import BlockBlock from './BlockBlock'
import BlockChannels from './BlockChannels'

interface ChatState
{
    md: any
    isClosed: boolean
}

interface ChatProps
{
    user: any
    channels: any
    messages: any
    blocks: any
    setChannels: (data: any) => void
    setMessages: (data: any) => void
    setMessagesUser: (data: any) => void
    setBlocks: (data: any) => void
}

class Chat extends React.Component<ChatProps, ChatState>
{
    constructor(props: any)
    {
        super(props)
        this.state = {
            md: 1,
            isClosed: true,
        }

        
    }

    // --- LIFE CYCLE

    componentDidMount()
    {
               // if (!this.state.socket)
        // {
        //     const socket = io('http://localhost:8000', {
        //         auth: {
        //         token: 'votre_token_d_authentification',
        //         // Autres données d'authentification personnalisées si nécessaire
        //         },
        //     });
        
        //     // Écouter les événements WebSocket
        //     socket.on('connect', () => {
        //         console.log('Channel Connected to server');
        //     });
        
        //     socket.on('disconnect', () => {
        //         console.log('Disconnected from server');
        //     });

        //     socket.on('c-channels', (data: any) => {
        //         console.log('socket channels ...', data)
        //         this.props.setChannels(data.channels)
        //     });

        //     socket.on('c-messages-user', (data: any) => {
        //         console.log('socket messages user ...', data)
        //         const sortedMessages = data.messages.sort((a: any, b: any) => {
        //             const dateA = new Date(a.updated_at).getTime();
        //             const dateB = new Date(b.updated_at).getTime();
        //             return dateA - dateB;
        //         });
        //         this.props.setMessagesUser(sortedMessages)
        //     });

        //     socket.on('c-messages-channel', (data: any) => {
        //         console.log('socket messages channel ...', data)
        //         const sortedMessages = data.messages.sort((a: any, b: any) => {
        //             const dateA = new Date(a.updated_at).getTime();
        //             const dateB = new Date(b.updated_at).getTime();
        //             return dateA - dateB;
        //         });
        //         this.props.setMessages(sortedMessages)
        //     });

        //     // Mettre à jour l'état avec le socket
        //     this.setState({ socket });
        // }
    }


    componentDidUpdate(prevProps: Readonly<ChatProps>, prevState: Readonly<ChatState>, snapshot?: any): void {
        
    }

    // --

    hanndleOnClose()
    {
        this.setState({
            ...this.state,
            isClosed: !this.state.isClosed, 
        })
    }

    handleChannelsOnClick()
    {
        this.setState({
            ...this.state.md,
            md: 1,
        })
    }

    handleChatOnClick()
    {
        this.setState({
            ...this.state.md,
            md: 2,
        })
    }

    handleBlockOnClick()
    {
        this.setState({
            ...this.state.md,
            md: 3,
        })
    }

    render()
    {
        return (
            <>
                <div id="chat" className={ this.state.isClosed ? 'closed' : '' }>
                    
                    <div className="top-close">
                        <button onClick={ () => this.hanndleOnClose() }>
                            <FontAwesomeIcon icon={ faTimes } />
                        </button>
                    </div>

                    <div className="block-top">
                        <button onClick={ () => this.handleChannelsOnClick() }>Channels</button>
                        <button onClick={ () => this.handleChatOnClick() }>Chat</button>
                        <button onClick={ () => this.handleBlockOnClick() }>Blocks</button>
                    </div>

                    <div className={ 'block-channels' + (this.state.md === 1 ? ' selected' : '') }>
                        <BlockChannels /> 
                    </div>

                    <div className={ 'block-chat' + (this.state.md === 2 ? ' selected' : '') }>
                        <BlockChat />    
                    </div>
                    
                    <div className={ 'block-blocks' + (this.state.md === 3 ? ' selected' : '') }>
                        <BlockBlock /> 
                    </div>
                    
                </div>
                <button id="chat-btn" onClick={ () => this.hanndleOnClose() }>
                    <FontAwesomeIcon icon={ faPaperPlane } />
                </button>
            </>
            
        )
    }

}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
    channels: state.chat.channels,
    messages: state.chat.messages,
    messages_user: state.chat.messages_user,
    blocks: state.chat.blocks,
});

const mapDispatchToProps = {
    setChannels, 
    setMessages, 
    setMessagesUser,
    setBlocks,
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
