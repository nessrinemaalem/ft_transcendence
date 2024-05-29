import React from 'react'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faEllipsis, faTimes, } from '@fortawesome/free-solid-svg-icons'
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'
import { Link } from 'react-router-dom';

interface BlockBlockState
{
    toolsStyle: any
    toolsIsSelected: boolean
    users_blocked: any
    users_blocked_current: any
}

interface BlockBlockProps
{
    user: any
}

class BlockBlock extends React.Component<BlockBlockProps, BlockBlockState>
{
    refTools: any

    constructor(props: any)
    {
        super(props)
        this.state = {
            toolsStyle: {},
            toolsIsSelected: false,
            users_blocked: [],
            users_blocked_current: null,
        }

        this.refTools = React.createRef()


        SOCKET_ONCE._socket.on('c-users-blocked', (data: any) => {
            console.log('socket users blocked ...', data)
            this.setState({
                ...this.state,
                users_blocked: data.users_blocked,
            })
        });

        // if deconnect & connect
        SOCKET_ONCE.onConnectChatBlock = () => {
            if (this.props.user)
            {
                console.log('user block on connect ...')
                SOCKET_ONCE._socket.emit('c-users-blocked', { 
                    user_id: this.props.user.id,
                });
            }
        }
    }

    componentDidMount(): void 
    {
        console.log('user block on connect ...')
        SOCKET_ONCE._socket.emit('c-users-blocked', { 
            user_id: this.props.user.id,
        });
    }

    handleOnOptions(event: any, user_blocked: any)
    {
        
        const element = event.currentTarget
        const objetRect = element.getBoundingClientRect() //button
        console.log(element, objetRect)

        const objectRectClient = this.refTools.current.getBoundingClientRect()
        
        const style = {
            display: 'block',
            top: objetRect.top + 'px',
            right: (window.innerWidth - objetRect.left) + 'px',
        }
        this.setState({
            ...this.state,
            toolsStyle: style,
            toolsIsSelected: true,
            users_blocked_current: user_blocked,
        })

    }

    handleBlockToolsOnClick()
    {
        this.setState({
            ...this.state,
            toolsIsSelected: false,
        })
    }

    handleBlockUnblock(event: any)
    {
        event.stopPropagation();
        // save database

        const { users_blocked_current } = this.state;

        console.log('delete ... ', users_blocked_current)

        const url = `/chat/blocks/${users_blocked_current.id}/destroy`
        let postData = {
        }

        //console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            //body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log(data);
            // if (data.channel)
            //     SOCKET_ONCE._socket.emit('c-channels', { });
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

        this.setState({
            ...this.state,
            toolsIsSelected: false,
        }, () => {})
    } 


    // -- RENDER
    
    renderUsers()
    {
        const elements = []
        for (let index = 0; index < this.state.users_blocked.length; index++) 
        {
            let user_blocked = this.state.users_blocked[index]

            let avatar = 'https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp'
            if (user_blocked.blocked_user.avatar)
            {
                if (user_blocked.blocked_user.avatar.startsWith('https://'))
                    avatar = user_blocked.blocked_user.avatar
                else
                    avatar = '/' + user_blocked.blocked_user.avatar
            }

            elements.push(
                <div className="user" key={ user_blocked.id }>
                    <Link to={ '/user/' + user_blocked.blocked_user.username } className="avatar">
                        <img src={ avatar }/>
                    </Link>
                    <div className="name">{ user_blocked.blocked_user.username }</div>
                    <button onClick={ (event: any) => this.handleOnOptions(event, user_blocked) }>
                        <FontAwesomeIcon icon={ faEllipsis } />
                    </button>
                </div>
            )
        }
        return elements
    }

    render()
    {
        return (
            <>
                <div className="block-users">
                   { this.renderUsers() }
                </div>

                <div className={ 'block-tools' + (this.state.toolsIsSelected ? ' selected' : '') } ref={ this.refTools }
                    onClick={ () => this.handleBlockToolsOnClick() }>
                    <div className="bt-container" style={ this.state.toolsStyle }>
                        <button onClick={ (event: any) => this.handleBlockUnblock(event) }>Retirer Block User</button>
                    </div>
                </div>
            </>
        )
    }

}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(BlockBlock);