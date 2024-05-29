import React from 'react'
import { connect } from 'react-redux';
import { io } from "socket.io-client";
import GameHome from './GameHome'
import GameCurrent from './GameCurrent'
import { setGame, } from '../store/actions';
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'

interface GameState
{
    currentItem: number
    games: []
}

interface GameProps
{
    user: any
    game: any
    setGame: (data: any) => void
}

class Game extends React.Component<GameProps, GameState>
{
    isDataDone: boolean = false

    constructor(props: any) 
    {
        super(props);
        this.state = {
            currentItem: 0,
            games: [],
        };

        // -- SOCKET_ONCE -- GAME 

        SOCKET_ONCE._socket.on('g-games', (data: any) => {
            console.log('socket games ...', data)
            this.setState({ 
                ...this.state,
                games: data.games
            });
        });

        SOCKET_ONCE._socket.on('g-join', (data: any) => {
            console.log('socket game join ...', data)
        });

        SOCKET_ONCE._socket.on('g-leave', (data: any) => {
            console.log('socket game leave ...', data)
            this.props.setGame({
                ...this.props.game,
                game_history: null,
                game_is_player: false,
            })
        });

        SOCKET_ONCE.onConnectGame = () => {
            SOCKET_ONCE._socket.emit('g-games', { user: this.props.user, })
            SOCKET_ONCE._socket.emit('g-games-game', { user: this.props.user, });
        }
    }

    componentDidMount()
    {
        console.log('Game componentDidMount ...')
    }

    componentDidUpdate(prevProps: Readonly<GameProps>, prevState: Readonly<GameState>, snapshot?: any): void 
    {
        console.log('Game componentDidUpdate ...')

        // -- TRIGGER SOCKET_ONCE get data
        if (this.props.user && !this.props.game.game_load_once)
        {
            console.log('load data one ...')
            // rechercher les jeux visible
            SOCKET_ONCE._socket.emit('g-games', { user: this.props.user, })
            // rechercher le jeux que je dois jouer
            SOCKET_ONCE._socket.emit('g-games-game', { user: this.props.user, });
            
            this.props.setGame({
                ...this.props.game,
                game_load_once: true,
            }) 
        }

        // if (prevProps.game_current !== this.props.game_current)
        // {
        //     console.log('load data update ...')
        //     SOCKET_ONCE._socket.emit('g-games', { user: this.props.user, })
        //     SOCKET_ONCE._socket.emit('g-games-game', { user: this.props.user, });
        // }
    }

    componentWillUnmount(): void 
    {
        console.log('Game componentWillUnmount ...')

        // if sign out
        // if (!this.props.user && this.props.game_current)
        // {
        //     SOCKET_ONCE._socket.emit('g-leave', { game_history: this.props.game_current.game_history, roomId: 'rg-' + this.props.user.id });
        // }
    }

    handleItemClick(index: number) 
    {
        this.setState({ 
            currentItem: index 
        });
    }

    render() 
    {
        return (
            <div id="game">
                <div className="menu-items">
                    <button onClick={() => this.handleItemClick(0)}>Game Home</button>
                    <button onClick={() => this.handleItemClick(1)}>Game</button>
                </div>

                <div className={'main-items'}>
                    <div className={'mi-item' + (this.state.currentItem === 0 ? ' selected' : '')}>
                        <GameHome games={ this.state.games } isSelected={ this.state.currentItem === 0 } />
                    </div>
                    <div className={'mi-item' + (this.state.currentItem === 1 ? ' selected' : '')}>
                        <GameCurrent isSelected={ this.state.currentItem === 1 } />
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
    game: state.game,
});

const mapDispatchToProps = {
    setGame,
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
