import React from 'react'
import ReactDOM from 'react-dom';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../home/Home';
import Chat from '../chat/Chat';
import Settings from '../settings/Settings';
import User from '../user/User';
import SignUp from '../sign-up/SignUp';
import SignIn from '../sign-in/SignIn';
import HomeUser from '../home-user/HomeUser';
import Menu from '../menu/Menu';
//import GuestRoute from './GuestRoute';
import { redirect, useParams } from "react-router-dom";

import { connect } from 'react-redux';
import { setUser, signIn } from '../store/actions';
import { AuthState } from '../store/authReducer'; 

import './sass/main.sass'
import UserShow from '../user-show/UserShow';


type PageProps = {
    user: any
    isLoggedIn: boolean;
    signIn: (data: any) => void
}

type PageState = {}

function UserShowRouter() 
{
    let params: any = useParams();
    let userId: any = params.id.match(/\d+/);
  
    return <UserShow id={params.id} />;
}

class Page extends React.Component<PageProps, PageState>
{
    constructor(props: PageProps) 
    {
        super(props)
    }

    componentDidMount(): void 
    {
        
    }

    componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<PageState>, snapshot?: any): void {
        

    }

    render()
    {
        const { isLoggedIn } = this.props;

        const dashboard = () => {
            
            if (!this.props.user)
            {
                return (
                    <Routes>
                        <Route path="/test" element={<Navigate to="/sign-in" />} />
                        <Route path="/" element={<Navigate replace to="/sign-in" />} />
                        <Route path="/chat" element={<Navigate replace to="/sign-in" />} />
                        <Route path="/settings" element={<Navigate replace to="/sign-in" />} />
                        <Route path="/user" element={<Navigate replace to="/sign-in" />} />
                        <Route path="/user/:id" element={<Navigate replace to="/sign-in" />} />
                        <Route path="/home-user" element={<Navigate replace to="/sign-in" />} />
                    </Routes>
                )
            
            }

            return (
                <Routes>
                    <Route path="/test" element={<Navigate to="/" />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/user" element={<User />} />
                    <Route path="/user/:id" element={<UserShowRouter />} />
                    <Route path="/home-user" element={<HomeUser />} />
                </Routes>
            )
        } 

        return (
            <>
                
                <div id="page-sign" className={!isLoggedIn ? 'visible' : ''}>
                    <Routes>
                        <Route path="/" element={<SignIn />} />
                        {this.props.user ? (
                            <>
                                <Route path="/sign-in" element={<Navigate replace to="/" />} />
                                <Route path="/sign-up" element={<Navigate replace to="/" />} />
                            </>
                        ) : (
                            <>
                                <Route path="/sign-in" element={<SignIn />} />
                                <Route path="/sign-up" element={<SignUp />} />
                            </>
                        )}
                    </Routes>
                </div>
                <div id="page" className={isLoggedIn ? 'visible' : ''}>
                    <Menu />
                    <div className="page-container">
                    {  dashboard() }
                    </div>
                </div>
            </>
        )
    }
}

const mapStateToProps = (state: { auth: AuthState }) => ({
    user: state.auth.user,
    isLoggedIn: state.auth.isLoggedIn
});

const mapDispatchToProps = {
    signIn,
};

export default connect(mapStateToProps, mapDispatchToProps)(Page);