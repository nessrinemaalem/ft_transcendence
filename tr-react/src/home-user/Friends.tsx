import React from 'react'
import { connect } from 'react-redux';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faUser, faTimes, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'

interface FriendsState
{
    toolsStyle: any
    toolsIsSelected: boolean
    toolsData: any
    friends: any
}

interface FriendsProps
{
    user: any
    game: any
}

class Friends extends React.Component<FriendsProps, FriendsState>
{
    refTools: any
    isComponentMounted: boolean = false

    constructor(props: any)
    {
        super(props)
        this.state = {
            toolsStyle: {},
            toolsIsSelected: false,
            toolsData: null,
            friends: [],
        }

        this.refTools = React.createRef()

        SOCKET_ONCE._socket.on('friends', (data: any) => {
            console.log('socket friends ...', data)
            const users = data.friends
            const friends = users.map((data: any) => {
                let friend: any = {
                    friend_id: data.id,
                    friend_status: data.status,
                    is_asked: data.user_1.id === this.props.user.id,
                }
                let user: any
                if (data.user_1.id === this.props.user.id)
                    user = data.user_2
                else
                    user = data.user_1
                friend = {
                    ...friend,
                    ...user
                }
                return friend
            })
            console.log('friends', friends)
            this.setState((prevState: any) => ({
                friends: [ ...friends],
            }));
        });

        // if deconnect & connect
        SOCKET_ONCE.onConnectFriends = () => {
            if (this.props.user)
            {
                SOCKET_ONCE._socket.emit('friends', { user: this.props.user, });
            }
        }
    }
  
    componentDidMount(): void
    {

        if (this.props.user)
        {
            SOCKET_ONCE._socket.emit('friends', { user: this.props.user, });
        }
        // if (!this.isComponentMounted && this.props.socket && this.props.user)
        // {
        //     this.isComponentMounted = true
        //     this.props.socket.on('friends', (data: any) => {
        //         console.log('socket ...', data)
        //         const users = data.friends
        //         const friends = users.map((data: any) => {
        //             let friend: any = {
        //                 friend_id: data.id,
        //                 friend_status: data.status,
        //                 is_asked: data.user_1.id === this.props.user.id,
        //             }
        //             let user: any
        //             if (data.user_1.id === this.props.user.id)
        //                 user = data.user_2
        //             else
        //                 user = data.user_1
        //             friend = {
        //                 ...friend,
        //                 ...user
        //             }
        //             return friend
        //         })
        //         console.log('friends', friends)
        //         this.setState((prevState: any) => ({
        //             friends: [ ...friends],
        //         }));
        //     });
            // this.props.socket.emit('leave', { user: this.props.user, roomId: 'rf-' + this.props.user.id });
            // this.props.socket.emit('join', { user: this.props.user, roomId: 'rf-' + this.props.user.id });
            // this.props.socket.emit('friends', { user: this.props.user, roomId: 'wf-' + this.props.user.id  });
        //}  
    }
    
    // --- 

    handleFriendsOnSearch(event: any)
    {
        console.log('on search', event.currentTarget.parentElement.querySelector('input').value)

        let postData = {
            username: event.currentTarget.parentElement.querySelector('input').value,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch('/friends/search', {
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
            console.log(data);
            // other actions ...
            // ex: update vue
            this.handleFriendsOnAsk(event, data.friend)
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleFriendsOnAsk(event: any, friend: any)
    {
        const url = `/friends/${this.props.user.id}/store`
        let postData = {
            id_friend: friend.id
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


            console.log('fiend requested ...', data.friend)
            if (data.friend)
            {
                SOCKET_ONCE._socket.emit('friends', { user_id: data.friend.user_1_id });
                SOCKET_ONCE._socket.emit('friends', { user_id: data.friend.user_2_id });
            }
            // const existingUser = this.state.friends.find((f: any) => f.id === friend.id)
            // if (existingUser)
            // {
            //     this.setState({
            //         ...this.state,
            //         friends: [...this.state.friends]
            //     });
            // }
            console.log(data);
            
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleFriendsOnAccept(event: any, friend: any)
    {
        const url = `/friends/${this.props.user.id}/update-status`
        let postData = {
            id_friend: friend.friend_id,
            status: 1,
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

            console.log('fiend accepted ...', data.friend)
            if (data.friend)
            {
                SOCKET_ONCE._socket.emit('friends', { user_id: data.friend.user_1_id });
                SOCKET_ONCE._socket.emit('friends', { user_id: data.friend.user_2_id });
            }
            
            // const existingUser = this.state.friends.find((f: any) => f.id === friend.id)
            // if (existingUser)
            // {
            //     this.setState({
            //         ...this.state,
            //         friends: [...this.state.friends]
            //     });
            // }
            // console.log(data);
            
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleFriendsOnDelete(event: any, friend: any)
    {
        const url = `/friends/${this.props.user.id}/destroy`
        let postData = {
            id_friend: friend.friend_id,
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

            
            console.log('fiend deleted ...', data.friend)
            if (data.friend)
            {
                SOCKET_ONCE._socket.emit('friends', { user_id: data.friend.user_1_id });
                SOCKET_ONCE._socket.emit('friends', { user_id: data.friend.user_2_id });
            }
            // const existingUser = this.state.friends.find((f: any) => f.id === friend.id)
            // if (existingUser)
            // {
            //     this.setState({
            //         ...this.state,
            //         friends: [...this.state.friends]
            //     });
            // }
            // console.log(data);
            
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleOnOptions(event: any, data: any)
    {
        
        const element = event.currentTarget
        const objetRect = element.getBoundingClientRect() //button
        //console.log(element, objetRect)

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
            toolsData: data,
        })

    }

    handleBlockToolsOnClick()
    {
        this.setState({
            ...this.state,
            toolsIsSelected: false,
        })
    }


    handleFriendsOnInvite(event: any)
    {
        console.log('data ...', this.state.toolsData)
        const url = `/games-his/store`
        let postData = {
            game_id: 1,
            player_1_id: this.props.user.id,
            player_2_id: this.state.toolsData.id,
            mode: this.props.game.game_options ? this.props.game.game_options.mode : 4,
            is_mode_spectator: this.props.game.game_options ? this.props.game.game_options.is_mode_spectator : false,
            is_ai: 0,
            max_scores: this.props.game.game_options ? this.props.game.game_options.max_scores : 2,
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

            
            console.log('game imvite ...', data) 
          
            // const existingUser = this.state.friends.find((f: any) => f.id === friend.id)
            // if (existingUser)
            // {
            //     this.setState({
            //         ...this.state,
            //         friends: [...this.state.friends]
            //     });
            // }
            // console.log(data);
            
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }


    // -- RENDER


    renderFriendsNew(data: any)
    {
        return (
            <div className="user u-new"  key={ data.id }>
                <div className="avatar">
                    <img src={ data.avatar ? data.avatar : 'https://pics.craiyon.com/2023-10-02/379b61f1e2bc4c7f81a0874e307f8d8f.webp'  }/>
                </div>
                <div className="name">{ data.username }</div>
                {data.friend_status === 0 && data.is_asked ? (
                    <button>Attente</button>
                ) : (
                    <>
                        <button onClick={(event: any) => this.handleFriendsOnAccept(event, data)}>Accept</button>
                        <button onClick={(event: any) => this.handleFriendsOnDelete(event, data)}>Refuser</button>
                    </>
                )}
             </div> 
        )
    }

    renderFriendsOther(data: any)
    {
        let status = ''

        if (data.status === 0)
            status = 'Off Line'
        else if (data.status === 1)
            status = 'On Line'
        else if (data.status === 1)
            status = 'En Jeu'

        return (
            <div className="user" key={ data.id }>
                <div className="avatar">
                    <img src={ data.avatar ? data.avatar : 'https://pics.craiyon.com/2023-10-02/379b61f1e2bc4c7f81a0874e307f8d8f.webp' }/>
                </div>
                <div className="name">{ data.username }</div>
                <div className="status">
                    <div className="indicator"></div>
                    <div className="value">{ status }</div>
                </div>
                <button onClick={ (event: any) => this.handleOnOptions(event, data) }>
                    <FontAwesomeIcon icon={ faEllipsis } />
                </button>
            </div>
        )
    }

    renderFriends()
    {
        const elements = []
        for (let index = 0; index < this.state.friends.length; index++) 
        {
            if (this.state.friends[index].friend_status <= 0)
                elements.push(this.renderFriendsNew(this.state.friends[index]))
            else
                elements.push(this.renderFriendsOther(this.state.friends[index]))
        }
        return elements
    }

    renderTools()
    {
        return (
            <div className={ 'block-tools' + (this.state.toolsIsSelected ? ' selected' : '') } ref={ this.refTools }
                onClick={ () => this.handleBlockToolsOnClick() }>
                <div className="bt-container" style={ this.state.toolsStyle }>
                    <button onClick={ (event) => this.handleFriendsOnInvite(event) }>Invite</button>
                    <button onClick={ (event) => this.handleFriendsOnDelete(event, this.state.toolsData) }>Delete</button>
                </div>
            </div>
        )
    }

    render()
    {
        return (
            <>
                <div className="friends">
                    <div className="search">
                        <div className="form">
                            <input type="text" />
                            <button onClick={ (event: any) => this.handleFriendsOnSearch(event) }>+</button>
                        </div>
                        <div className="message">The user already added.</div>
                    </div>
                    <div className="list">
                        { this.renderFriends() }
                    </div>
                </div>
                { this.renderTools() } 
            </>
        )
    }

}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
    game: state.game,
});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
