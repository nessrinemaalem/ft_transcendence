import React from 'react'
import { connect } from 'react-redux';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faUser, } from '@fortawesome/free-solid-svg-icons'
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'

import HomeUser from '../home-user/HomeUser'
import Chat from '../chat/Chat'
import Game from '../game/Game'

interface HomeState
{
    loadDataOnce: boolean
}

interface HomeProps
{
    user: any
}

class Home extends React.Component<HomeProps, HomeState>
{
    constructor(props: any)
    {
        super(props)
        this.state = {
            loadDataOnce: false,
        }

        SOCKET_ONCE._socket.on('u-join', (data: any) => {
            if (data && this.props.user)
            {
                console.log('u-user ...')
                console.log(data)
                
            }
        });

        SOCKET_ONCE.onConnect = () => {
            SOCKET_ONCE._socket.emit('u-join', { 
                user: this.props.user,
            });
        }
    }

    componentDidMount(): void 
    {
        console.log('Home componentDidMount ...')
        this.setState({
            ...this.state,
            loadDataOnce: false,
        })
    }

    componentDidUpdate(prevProps: Readonly<HomeProps>, prevState: Readonly<HomeState>, snapshot?: any): void {
        
        console.log('User componentDidUpdate ...')
        if (this.props.user && !this.state.loadDataOnce)
        {
            this.setState({
                ...this.state,
                loadDataOnce: true,
            }, () => {

                SOCKET_ONCE._socket.emit('u-join', { 
                    user: this.props.user, 
                })
            })
        }
        
    }

    // handleOnSearch()
    // {
    //     const postData = {
    //         keyword: 'user',
    //     };
        
    //     fetch('/users', {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Access-Control-Allow-Origin': '*', 
    //         },
    //         //body: JSON.stringify(postData)
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //         throw new Error('Network response was not ok');
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         console.log(data);
    //         let user = {
    //             name: data[0].username,
    //         }
    //         this.setState({
    //             ...this.state,
    //             ...user,
    //         })
    //         // other actions ...
    //         // ex: update vue
    //     })
    //     .catch(error => {
    //         console.error('There was a problem with your fetch operation:', error);
    //     });
    // }

    render()
    {
        return (
            <div id="home">
                <HomeUser />
                <Game />
                <Chat />
            </div>
        )
    }

}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
});

const mapDispatchToProps = {
    
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);