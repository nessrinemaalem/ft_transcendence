import React from 'react'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad } from '@fortawesome/free-solid-svg-icons'
import { setGame, } from '../store/actions';
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'

interface GameHomeState
{
    
}

interface GameHomeProps
{
    isSelected: boolean
    games: any
    user: any
    game: any
    setGame: (data: any) => void
}

class GameHome extends React.Component<GameHomeProps, GameHomeState>
{
    constructor(props: any)
    {
        super(props)
    }

    handleViewOnClick(data: any)
    {
        if (this.props.user 
            && this.props.game.game_current
            && this.props.game.game_current.game_history
            && (
                this.props.game.game_current.game_history
                .player_1_id === this.props.user.id
                || this.props.game.game_current.game_history
                .player_2_id === this.props.user.id
                )
            )
            return ;
        
        console.log('game history',  data)

        SOCKET_ONCE._socket.emit('g-join', { 
            game_history: data,
            user: this.props.user,
        });
        this.props.setGame({
            ...this.props.game,
            game_history: data,
            //game_load_once: false,
        })
    }

    renderGames()
    {
        const elements = []

        for (let index = 0; index < this.props.games.length; index++) 
        {
            const game = this.props.games[index]
            elements.push(
                <div className="game" key={ game.id }>
                    <div className="block-info">
                        <div className="game-icon">
                            <FontAwesomeIcon icon={ faGamepad } />
                        </div>
                        <div className="info">
                            <div className="name">pong</div>
                        </div>
                    </div>
                    <div className="block-players">
                        <div className="user-1">
                            <a className="avatar">
                                <img src="https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp" alt=""/>
                            </a>
                            <div className="username">#{ game.player_1.username }</div>
                        </div>
                        <div className="vs">VS</div>
                        <div className="user-2">
                            <a className="avatar">
                                <img src="https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp" alt=""/>
                            </a>
                            <div className="username">#{ game.player_2 ? game.player_2.username : 'AI' }</div>
                        </div>
                    </div>
                    <div className="block-more">
                        {game.is_mode_spectator && (
                            <button onClick={ () => this.handleViewOnClick(game) }>View</button>
                        )}
                        <div className="date">{ new Date(game.player_1.created_at).toLocaleString('fr-FR', { timeZone: 'UTC' }) }</div>
                    </div>
                </div>
            )   
        }
        return elements
    }

    render()
    {
        return (
            <div className="game-home">
                <div className="games-matchmaking">
                   { this.renderGames() }
                </div>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(GameHome);
