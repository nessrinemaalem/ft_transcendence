import React from 'react'
import { connect } from 'react-redux';
import { Pong } from './Pong/Pong'
import { setGame, setGameHistory, setGameOptions, } from '../store/actions';
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'

interface GameCurrentState
{
    maxScore: number
    mode: number
    isViewer: boolean
    isAI: boolean
    isGameReady: boolean
    isReady: boolean

    data: any
}

interface GameCurrentProps
{
    isSelected: boolean
    user: any
    game: any
    setGame: (data: any) => void
}

class GameCurrent extends React.Component<GameCurrentProps, GameCurrentState>
{
    gameRef: React.RefObject<HTMLDivElement>
    pong: any = null

    constructor(props: any)
    {
        super(props)
        this.state = {
            maxScore: 2,
            mode: 5,
            isViewer: false,
            isAI: false,
            isGameReady: true, // tmp => false
            isReady: false,

            data: {
                score: {
                    player_1: 0,
                    player_2: 0,
                } 
            }
        }
        
        this.gameRef = React.createRef()

        SOCKET_ONCE._socket.on('g-leave', (data: any) => {
            console.log('socket game leave ...', data)
            if (this.pong)
                this.pong.end()
        });

        // si il recoit veut dire qu'il a un jeu en cour ou a visionner
        SOCKET_ONCE._socket.on('g-games-game', (data: any) => {
            if (data && this.props.user)
            {
                console.log('g-games-game ... ', data.game_history)
                this.props.setGame({
                    ...this.props.game,
                    game_history: data.game_history,
                    game_is_player: (data.game_history.player_1_id === this.props.user.id) || (data.game_history.player_2_id === this.props.user.id),
                })
            }
        });

        // si il recoit veut dire qu'il a un jeu en cour ou a visionner
        SOCKET_ONCE._socket.on('g-games-game-play', (data: any) => {
            if (data && this.props.user)
            {
                //console.log('g-games-game-play ...', this.props.game.game_is_player)
                if (this.pong !== null)
                    this.pong.serverStart(data)
                // empecher de jouer ... 
                if (!this.props.game.game_is_player)
                {
                    data.isPlayer1Ready = false
                    data.isPlayer2Ready = false
                }
                this.updataViewData(data)
                if (data.isEnd)
                {
                    SOCKET_ONCE._socket.emit('g-games-game-play', { 
                        game_history: this.props.game.game_history,
                        user: this.props.user, 
                        game_data: data,
                    });
                }
            }
        });

        // if deconnect & connect
        SOCKET_ONCE.onConnectGameCurrent = () => {
            // joindre partie si existe
            SOCKET_ONCE._socket.emit('g-games-game', { 
                user: this.props.user, 
            });
        }
        
    }

    componentDidMount(): void
    { 
        console.log('GameCurrent componentDidMount ... ')
    }

    componentDidUpdate(prevProps: Readonly<GameCurrentProps>, prevState: Readonly<GameCurrentState>, snapshot?: any): void 
    {
        console.log('GameCurrent componentDidUpdate ... ', this.props.game)
        // -- PREPARE ONCE PONG GAMEtr-react/build/static
        this.once()
    }

    once()
    {
        if (
            !this.pong
            && this.gameRef.current
            && this.gameRef.current.clientWidth
            && this.gameRef.current.clientHeight
        ) 
        {
            console.log('GameCurrent Pong ... ')

            this.pong = new Pong({ 
                element: this.gameRef.current,
                onServerPlayerMovement: (data: any) => {

                    if (!this.props.game.game_is_player)
                        return

                    console.log('GameCurrent Pong keys ... ', data)

                    if (data.player1 
                        && this.props.game.game_history.player_2_id === this.props.user.id)
                        data.player1 = null
                    if (!this.props.game.game_history.is_ai && data.player2
                        && this.props.game.game_history.player_1_id === this.props.user.id)
                        data.player2 = null

                    SOCKET_ONCE._socket.emit('g-games-game-play', { 
                        game_history: this.props.game.game_history,
                        user: this.props.user, 
                        game_data: data,
                    });
                },
            });

            this.props.setGame({
                ...this.props.game,
                game_options: {                    
                    is_mode_spectator: this.state.isViewer ? 1 : 0,
                    is_ai: this.state.isAI ? 1 : 0,
                    mode: this.state.mode,
                    max_scores: this.state.maxScore,
                }
            })
        }
    }

    updataViewData(data: any)
    {
        if (data)
        {
            if (this.state.data.score.player_1 !== data.score.player_1)
            {
                let tmp: any = {
                    ...this.state,
                }
                tmp.data.score.player_1 = data.score.player_1
                this.setState(tmp)
            }
            if (this.state.data.score.player_2 !== data.score.player_2)
            {
                let tmp: any = {
                    ...this.state,
                }
                tmp.data.score.player_2 = data.score.player_2
                this.setState(tmp)
            }
        }
    }

    handleMaxScoreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);
        if (!isNaN(value) && value >= 1 && value <= 10) {
            this.setState({
                ...this.state, 
                maxScore: value,
            }, () => {
                this.props.setGame({
                    ...this.props.game,
                    game_options: {              
                        ...this.props.game.game_options,
                        max_scores: this.state.maxScore,
                    }
                })
            });
        }
    }
    
    handleModeOnClick(mode: number)
    {
        this.setState({
            ...this.state,
            mode: mode,
        }, () => {
            this.props.setGame({
                ...this.props.game,
                game_options: {                    
                    ...this.props.game.game_options,
                    mode: this.state.mode,
                }
            })
            // if (this.pong)
            //     this.pong.setLevel(this.state.mode === 1 ? 4 : 10)
        })
    }

    handleViewerOnClick()
    {
        this.setState({
            ...this.state,
            isViewer: !this.state.isViewer,
        }, () => {
            this.props.setGame({
                ...this.props.game,
                game_options: {                    
                    ...this.props.game.game_options,
                    is_mode_spectator: this.state.isViewer ? 1 : 0,
                }
            })
        })
    }

    handleAIOnClick()
    {
        this.setState({
            ...this.state,
            isAI: !this.state.isAI,
        }, () => {
            this.props.setGame({
                ...this.props.game,
                game_options: {                    
                    ...this.props.game.game_options,
                    is_ai: this.state.isAI ? 1 : 0,
                }
            })
        })
    }

    handleReady()
    {
        console.log('GameCurrent handleReady ...')

        this.setState({
            ...this.state,
            //isReady: true,
        }, () => {

            let player1 = null
            if (this.props.game.game_history.player_1_id === this.props.user.id)
            {
                player1 = {
                    isPlayer1Ready: true,
                }
            }

            let player2 = null
            if (this.props.game.game_history.player_2_id === this.props.user.id)
            {
                player2 = {
                    isPlayer2Ready: true,
                }
            }

            SOCKET_ONCE._socket.emit('g-games-game-play', { 
                game_history: this.props.game.game_history,
                user: this.props.user, 
                game_data: {
                    player1: player1,
                    player2: player2,
                    is_player: this.props.game.game_is_player,
                }
            });
        })
    }

    handlePause()
    {
        
    }

    handleGiveUp()
    {
        SOCKET_ONCE._socket.emit('g-games-game-play', { 
            game_history: this.props.game.game_history,
            user: this.props.user, 
            game_data: {
                is_give_up: this.props.user.id,
            }
        })
    }

    // -- RENDER

    renderForms()
    {
        // console.log('render form', this.props.game.game_current, this.props.user)
        let classIsPlayer = (this.props.game && this.props.game.game_is_player)
            ? ' is-player' : ''

        return (
            <>
                {/* <div className={ 'form' + classIsPlayer }>
                    <div className="row r-mode">
                        <label>Max Score</label>
                        <input 
                            type="number" 
                            placeholder="2" 
                            defaultValue={2}
                            
                            min={1} 
                            max={10} 
                            onChange={this.handleMaxScoreChange}
                        />
                    </div>
                </div> */}

                <div className={ 'form' + classIsPlayer }>
                    <div className="row r-mode">
                        <label>Mode</label>
                        <div className="options">
                            <button className={ this.state.mode === 5 ? 'selected' : '' }
                                onClick={ () => this.handleModeOnClick(5) }>Turtle</button>
                            <button className={ this.state.mode === 10 ? 'selected' : '' }
                                onClick={ () => this.handleModeOnClick(10) }>Rabbit</button>
                        </div>
                    </div>
                </div>
                <div className={ 'form' + classIsPlayer }>
                    <div className="row r-viewer">
                        <label htmlFor="">Viewer</label>
                        <div className="options">
                            <button className={ this.state.isViewer ? 'selected' : '' }
                                onClick={ () => this.handleViewerOnClick() }>{ this.state.isViewer ? 'Enable' : 'Disabled' }</button>
                        </div>
                    </div>
                </div>

                <div className={ 'form' + classIsPlayer }>
                    <div className="row r-viewer">
                        <label htmlFor="">VS AI</label>
                        <div className="options">
                            <button className={ this.state.isAI ? 'selected' : '' }
                                onClick={ () => this.handleAIOnClick() }>{ this.state.isAI ? 'Yes' : 'No' }</button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    render()
    {
        return (
            <div className={ 'game-current ready' }>
                
                {/* <div className="game-need-join"></div> */}

                <div className="game-ready">

                    <div className="game-noscreen">
                        Screen size too small!
                    </div>

                    <div className="game" ref={ this.gameRef }></div>

                    <div className={ 'info' }>
                        <div className="player-1">
                            <div className="name">#{ (this.props.game.game_history && this.props.game.game_history.player_1) ? this.props.game.game_history.player_1.username : 'player-1' }</div>
                            <div className="score">{ this.state.data.score.player_1 }</div>
                        </div>
                        <div className="vs">VS</div>
                        <div className="player-2">
                            <div className="name">#{ (this.props.game.game_history && this.props.game.game_history.player_2) ? this.props.game.game_history.player_2.username : 'player-2' }</div>
                            <div className="score">{ this.state.data.score.player_2 }</div>
                        </div>
                    </div>

                    {this.props.game.game_history 
                        && this.props.game.game_history.status === 1
                         && (
                        <div className="ready">
                            {this.state.isReady === false && (
                                <button onClick={() => this.handleReady()}>READY</button>
                            )}

                            {/* <button onClick={() => this.handlePause()}>PAUSE</button> */}
                            
                            {this.props.game.game_is_player && (
                                 <button onClick={() => this.handleGiveUp()}>GIVE UP</button>
                            )}
                        </div>
                    )}

                    { this.renderForms() }

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

export default connect(mapStateToProps, mapDispatchToProps)(GameCurrent);