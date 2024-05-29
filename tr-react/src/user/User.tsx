import React from 'react'
import { connect } from 'react-redux';
import BlockHistory from './BlockHistory'
import BlockUserMore from './BlockUserMore'
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'

interface UserState
{
    loadDataOnce: boolean
    userInfo: any
    userHistory: any
}

interface UserProps
{
    user: any
}

class User extends React.Component<UserProps, UserState>
{
    constructor(props: any)
    {
        super(props)
        this.state = {
            loadDataOnce: false,
            userInfo: null,
            userHistory: [],
        }

        SOCKET_ONCE._socket.on('u-user-stat', (data: any) => {
            if (data && this.props.user)
            {
                console.log('u-user-stat ...')
                console.log(data)
                this.setState({
                    ...this.state,
                    userInfo: data.info,
                    userHistory: data.history,
                })
            }
        });
    }

    componentDidMount(): void 
    {
        console.log('User componentDidMount ...')
        this.setState({
            ...this.state,
            loadDataOnce: false,
        })
    }

    componentDidUpdate(prevProps: Readonly<UserProps>, prevState: Readonly<UserState>, snapshot?: any): void {
        
        console.log('User componentDidUpdate ...')
        if (this.props.user && !this.state.loadDataOnce)
        {
            this.setState({
                ...this.state,
                loadDataOnce: true,
            }, () => {

                SOCKET_ONCE._socket.emit('u-user-stat', { 
                    user: this.props.user, 
                })
            })
        }
    }

    render()
    {
        return (
            <div id="user">
                
                <BlockHistory user={ this.props.user } 
                    userHistory={ this.state.userHistory } />         

                <BlockUserMore user={ this.props.user } 
                    userInfo={ this.state.userInfo } />

            </div>
        )
    }

}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
});

const mapDispatchToProps = {
    
};

export default connect(mapStateToProps, mapDispatchToProps)(User);