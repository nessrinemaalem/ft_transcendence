import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faBars, faTimes, } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux';
import { signOut } from '../store/actions' 

import './sass/main.sass'

interface MenuState
{
    isClosed: boolean
}

interface MenuProps
{
    user: any
    isLoggedIn: boolean
    signOut: () => void
}

class Menu extends React.Component<MenuProps, MenuState>
{
    constructor(props: any)
    {
        super(props)
        this.state = {
            isClosed: true
        }
    }

    handleOnClose()
    {
        this.setState({
            ...this.state,
            isClosed: !this.state.isClosed, 
        })
    }

    hanndleOnSignOut()
    {
        //event.stopPropagation();

        const url = `/sign-out`
        let postData = {
            user_id: this.props.user.id,
        }

        //console.log(postData, JSON.stringify(postData))
        
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

            console.log(data);

            this.props.signOut()
            
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });   
    }

    render()
    {
        const { isLoggedIn } = this.props
        
        return (
            <>
                <button id="menu-btn" onClick={ () => this.handleOnClose() }>
                    <FontAwesomeIcon icon={ faBars } />
                </button>
                <nav id="menu" className={ this.state.isClosed ? 'closed' : '' }>
                    <div className="top-close">
                        <button onClick={ () => this.handleOnClose() }>
                            <FontAwesomeIcon icon={ faTimes } />
                        </button>
                    </div>
                    <Link to="/">Home</Link>
                    {!isLoggedIn && (
                        <>
                            <Link to="/sign-in">Sign In</Link>
                            <Link to="/sign-up">Sign Up</Link>
                        </>
                    )}
                    <Link to="/user">User Profile</Link>
                    {/* <Link to="/user/4">User Show</Link> */}
                    <Link to="/settings">Settings</Link>
                    {isLoggedIn && (
                        <>
                            <button className="btn-sign-out"
                                onClick={() => {
                                    this.hanndleOnSignOut();
                                    // Rediriger vers la route '/'
                                    return <Navigate to="/" />;
                                }}>Sign Out</button>
                        </>
                    )}
                </nav>
            </>
        )
    }

}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
    isLoggedIn: state.auth.isLoggedIn
})

const mapDispatchToProps = {
    signOut
}


export default connect(mapStateToProps, mapDispatchToProps)(Menu)