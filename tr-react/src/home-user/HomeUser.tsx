import React from 'react'
import { connect } from 'react-redux';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faUser, faTimes, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { io } from "socket.io-client";
import Friends from './Friends';
import Matchmaking from './Matchmaking';
import { setGame, } from '../store/actions';
import SOCKET_ONCE from '../SocketCustom';

// https://socket.io/how-to/use-with-react
// https://dev.to/novu/building-a-chat-app-with-socketio-and-react-2edj

import './sass/main.sass'

interface HomeUserState
{
    isClosed: boolean
}

interface HomeUserProps
{
    user: any
    game: any
    setGame: (data: any) => void
}

class HomeUser extends React.Component<HomeUserProps, HomeUserState>
{
    socket: any

    constructor(props: any)
    {
        super(props)
        this.state = {
            isClosed: true,
        }
    }

    // --- LIFE CYCLE

    componentDidUpdate(prevProps: Readonly<HomeUserProps>, 
        prevState: Readonly<HomeUserState>, snapshot?: any): void {}

    componentWillUnmount(): void {}
    
    // --- Handler

    hanndleOnClose()
    {
        this.setState({
            ...this.state,
            isClosed: !this.state.isClosed, 
        })
    }

  
    handleMatchmakingOnSearch()
    {
        let postData = {
            game_id: 1,
            player_1_id: this.props.user.id,
            mode: this.props.game.game_options ? this.props.game.game_options.mode : 4,
            is_mode_spectator: this.props.game.game_options ? this.props.game.game_options.is_mode_spectator : false,
            is_ai: this.props.game.game_options ? this.props.game.game_options.is_ai : 0,
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

    handleMatchmakingOnAccept()
    {
        let postData = {
            player_2_id: this.props.user.id,
        }

        if (!this.props.game.game_history)
            return 
        console.log(postData, JSON.stringify(postData))
        const url = `/games-his/${ this.props.game.game_history.id }/accept`
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
            console.log(data);

            SOCKET_ONCE._socket.emit('g-games', { });
            SOCKET_ONCE._socket.emit('g-games-game', { user: this.props.user });

            // // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleMatchmakingOnCancel()
    {
        let postData = {
            game_id: 1,
            player_1_id: this.props.user.id,
            mode: this.props.game.game_options ? this.props.game.game_options.mode : 4,
            is_mode_spectator: this.props.game.game_options ? this.props.game.game_options.is_viwer : false,
            is_ai: this.props.game.game_options ? this.props.game.game_options.is_ai : 0,
            max_scores: this.props.game.game_options ? this.props.game.game_options.max_scores : 2,
        }

        if (!this.props.game.game_history)
            return 
        console.log(postData, JSON.stringify(postData))
        const url = `/games-his/${ this.props.game.game_history.id }/destroy`
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {
            console.log(data);

            SOCKET_ONCE._socket.emit('g-leave', { user: this.props.user, game_history: data.game_history });
            
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    // --- 

    // -- RENDER

    renderUserInfo() 
    {
        const username = this.props.user ? this.props.user.username : 'John Doe'
        let status = 0; 
        
    
        if (this.props.user && this.props.user.status === 1) {
            status = 1; 
        } else if (this.props.user && this.props.user.status === 2) {
            status = 2;
        }

        let statusLabel;
        switch (status) {
            case 1:
                statusLabel = 'Online';
                break;
            case 2:
                statusLabel = 'In Game';
                break;
            default:
                statusLabel = 'Offline';
                break;
        }
    
        let avatar = 'https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp'
        if (this.props.user.avatar)
        {
            if (this.props.user.avatar.startsWith('https://'))
                avatar = this.props.user.avatar
            else
                avatar = '/' + this.props.user.avatar
        }

        return (
            <div className="user-info">
                <div className="avatar">
                <img src={ avatar } />
                </div>
                <div className="detail">
                    <div className="ref">ID: #{ this.props.user.id }</div>
                    <div className="name">#{ username }</div>
                    <div className="status">
                        <div className={`indicator ${status === 1 ? 'online' : status === 2 ? 'in-game' : 'offline'}`}></div>
                        <div className="label">{statusLabel}</div>
                    </div>
                </div>
            </div>
        );
    }

    renderMatchmaking()
    {
        //console.log('renderMatchmaking ...', this.props.game.game_history)
        let message = ''
        let inGame = 0

        if (this.props.game.game_history)
        {
            
            if (this.props.game.game_history && this.props.game.game_history.status === 1)
            {
                if (
                    this.props.game.game_history.player_1_id === this.props.user.id
                    || this.props.game.game_history.player_2_id === this.props.user.id
                )
                {
                    inGame = 1
                }
            }

            else if (this.props.game.game_history && this.props.game.game_history.status === 0)
            {
                if (this.props.game.game_history.is_invited)
                {
                    if (this.props.game.game_history.player_1_id === this.props.user.id)
                        message = 'Attente Confirmation ...'
                    else if (this.props.game.game_history.player_2_id === this.props.user.id)
                        message = 'Refuser'
                }
                else
                {
                    message = 'En recherche ...'
                }
            }

        }

        const btnAccept = () => {
            if (this.props.game.game_history
                && this.props.game.game_history.status === 0
                && this.props.game.game_history.is_invited 
                && this.props.game.game_history.player_2_id === this.props.user.id)
            {
                return (
                    <div className="accept">
                        <div className="label">Acepter</div>
                        <button onClick={() => this.handleMatchmakingOnAccept()}>Accept</button>
                    </div>
                )
            }
        }

        return (
            <div className={'matchmaking'}>
                <h6>Matchmaking</h6>
                {(!this.props.game.game_history || this.props.game.game_history.is_viewer) && (
                        <div className="find">
                            <div className="label">Trouver adversaire</div>
                            <button onClick={() => this.handleMatchmakingOnSearch()}>Rechercher</button>
                        </div>
                    )
                }
                {this.props.game.game_history && !this.props.game.game_history.is_viewer && inGame === 0 && (
                    <>
                        <div className="on-progress">
                            <div className="label">{message}</div>
                            <button onClick={() => this.handleMatchmakingOnCancel()}>Annuler</button>
                        </div>
                    </>
                )}
                { btnAccept() }
                {inGame === 1 && (
                    <>
                        <div className="on-progress">
                            <div className="label">Partie en cours</div>
                        </div>
                    </>
                )}
            </div>
        )
    }
    
    render()
    {
        return (
            <>
                <div id="home-user" className={ this.state.isClosed ? 'closed' : '' }>
                    <div className="top-close">
                        <button onClick={ () => this.hanndleOnClose() }>
                            <FontAwesomeIcon icon={ faTimes } />
                        </button>
                    </div>
                    { this.renderUserInfo() }
                    { this.renderMatchmaking() }
                    <div className="hu-nav">
                        {/* <button>Friends</button>
                        <button>Match</button> */}
                    </div>
                    <div className="hu-contents">
                        <Friends />
                        {/* <Matchmaking socket={ this.state.socket } /> */}
                    </div>
                </div>
                <button id="home-user-btn" onClick={ () => this.hanndleOnClose() }>
                    <FontAwesomeIcon icon={ faUser } />
                </button>
            </>
        )
    }
}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
    game: state.game,
});

const mapDispatchToProps = {
    setGame,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeUser);
