import React from 'react'
import { connect } from 'react-redux';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faUser, faTimes, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { io } from "socket.io-client";


import './sass/main.sass'

interface MatchmakingState
{
    
}

interface MatchmakingProps
{
    user: any
}

class Matchmaking extends React.Component<MatchmakingProps, MatchmakingState>
{
    constructor(props: any)
    {
        super(props)
    }

    render()
    {
        return (
            <div className="Matchmaking">
                <h1>Matchmaking</h1>
            </div>
        )
    }
}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(Matchmaking);
