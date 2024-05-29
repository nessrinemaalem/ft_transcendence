import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faEllipsis, faTimes, faClock, } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

interface BlockHistoryState
{
    loadDataOnce: boolean
    isClosed: boolean
}

interface BlockHistoryProps
{
    user: any
    userHistory: any
}

export default class BlockHistory extends React.Component<BlockHistoryProps, BlockHistoryState>
{
    constructor(props: any)
    {
        super(props)
        this.state = {
            isClosed: true,
            loadDataOnce: false,
        }
    }
    
    componentDidMount(): void 
    {
        console.log('User componentDidMount ...')
        this.setState({
            ...this.state,
            loadDataOnce: false,
        })
    }

    componentDidUpdate(prevProps: Readonly<BlockHistoryProps>, prevState: Readonly<BlockHistoryState>, snapshot?: any): void {
            
        console.log('User componentDidUpdate ...')
        if (this.props.user && !this.state.loadDataOnce)
        {
            this.setState({
                ...this.state,
                loadDataOnce: true,
            }, () => {

            })
        }
    }


    hanndleOnClose()
    {
        this.setState({
            ...this.state,
            isClosed: !this.state.isClosed, 
        })
    }

    renderHistory()
    {
        let elements: any = []

        for (let index = 0; index < this.props.userHistory.length; index++) {
            const data = this.props.userHistory[index]
            let is_winner = false
            if (this.props.user.id === data.winner_id)
                is_winner = true
            const date = new Date(data.updated_at);
            const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
            
            let avatar_player_1 = 'https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp'
            if (data.player_1.avatar)
            {
                if (data.player_1.avatar.startsWith('https://'))
                    avatar_player_1 = data.player_1.avatar
                else
                    avatar_player_1 = '/' + data.player_1.avatar
            }
            
            let avatar_player_2 = 'https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp'
            if (data.player_2 && data.player_2.avatar)
            {
                if (data.player_2.avatar.startsWith('https://'))
                    avatar_player_2 = data.player_2.avatar
                else
                    avatar_player_2 = '/' + data.player_2.avatar
            }

            elements.push(
                <div className="history win" key={ data.id }>
                    
                    <div className="vs">
                        <Link to={'/user/' + data.player_1_id} className="user-1">
                                <img src={ avatar_player_1 } />
                            </Link>
                        <div>VS</div>
                        {data.is_ai ? (
                            <div className="user-2">
                                <img src="https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp" alt="" />
                            </div>
                        ) : (
                            <Link to={'/user/' + data.player_2_id} className="user-2">
                                <img src={ avatar_player_2 } />
                            </Link>
                        )}
                    </div>

                    <div className="date-result">
                        <div className="date">{ formattedDate }</div>
                        <div className="value">{ is_winner ? 'Win' : 'Lost' }</div>
                    </div>
                </div>
            )
        }
        return elements 
    } 
    

    render()
    {
        return (
            <>
                <div className={ 'block-history' + (this.state.isClosed ? ' closed' : '')}>
                    <div className="top-close">
                        <button onClick={ () => this.hanndleOnClose() }>
                            <FontAwesomeIcon icon={ faTimes } />
                        </button>
                    </div>
                    <h6>History</h6>
                    <div className="list">
                        { this.renderHistory() }
                    </div>
                </div>
                <button className="block-history-btn" onClick={ () => this.hanndleOnClose() }>
                    <FontAwesomeIcon icon={ faClock } />
                </button>
            </>
        )
    }

}