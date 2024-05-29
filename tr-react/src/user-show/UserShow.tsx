import React from 'react'
import { connect } from 'react-redux';
import BlockHistory from './BlockHistory'
import BlockUserMore from './BlockUserMore'
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'

interface UserShowState
{
    loadDataOnce: boolean
    user: any
    userInfo: any
    userHistory: any
}

interface UserShowProps
{
    id: any
}

export default class UserShow extends React.Component<UserShowProps, UserShowState>
{
    constructor(props: any)
    {
        super(props)
        this.state = {
            loadDataOnce: false,
            user: null,
            userInfo: null,
            userHistory: [],
        }
    }

    componentDidMount(): void 
    {
        console.log('UserShow componentDidMount ...')
        
        const url = `/users/${ this.props.id }/more`
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            }
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {
            console.log('profile autre user', data);
            // other actions .i..
            // ex: update vue
            this.setState({
                ...this.state,
                loadDataOnce: true,
                user: data.user,
                userHistory: data.userHistory,
                userInfo: data.userInfo,
            }, () => {

                
            })
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
       
    }

    componentDidUpdate(prevProps: Readonly<UserShowProps>, prevState: Readonly<UserShowState>, snapshot?: any): void {
        
        console.log('UserShow componentDidUpdate ...', this.props.id, this.state.user)
        if (prevProps.id !== this.props.id)
        {
            const url = `/users/${ this.props.id }/more`
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //'Access-Control-Allow-Origin': '*', 
                }
            })
            .then(response => {
                // if (!response.ok) {
                // throw new Error('Network response was not ok');
                // }
                return response.json();
            })
            .then(data => {
                console.log('profile autre user', data);
                // other actions ...
                // ex: update vue
                this.setState({
                    ...this.state,
                    loadDataOnce: true,
                    user: data.user,
                    userHistory: data.userHistory,
                    userInfo: data.userInfo,
                }, () => {
    
                    
                })
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
       
            
            this.setState({
                ...this.state,
                loadDataOnce: true,
            }, () => {

                
            })
        }
    }

    render()
    {
        console.log('id', this.props.id)
        return (
            <div id="user">
                
                <BlockHistory user={ this.state.user } 
                    userHistory={ this.state.userHistory } />         

                <BlockUserMore user={ this.state.user } 
                    userInfo={ this.state.userInfo } />

            </div>
        )
    }

}
