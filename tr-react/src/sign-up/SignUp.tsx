import React, { Component, FormEvent } from 'react';

import './sass/main.sass';

interface SignUpState {
    login_42: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    errors: any;
    message: string;
}

interface SignUpProps {}

export default class SignUp extends Component<SignUpProps, SignUpState> {
    constructor(props: SignUpProps) {
        super(props);
        this.state = {
            login_42: '',
            username: '',
            email: '',
            password: '',
            password_confirmation: '',
            errors: [],
            message: '',
        };
    }

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        this.setState({ [name]: value } as Pick<SignUpState, keyof SignUpState>);
    }

    handleOnSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const postData = {
            login_42: this.state.login_42,
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
            password_confirmation: this.state.password_confirmation
        };


        //  const postData = {
        //     login_42: this.state.login_42,
        //     username: this.state.username,
        //     email: this.state.email,
        //     password: this.state.password,
        //     password_confirmation: this.state.password_confirmation
        // };


        console.log(postData);

        fetch('/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            //     throw new Error('Erreur de réseau : ' + response.status);
            // }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.statusCode === 400)
            {
                this.setState({
                    ...this.state,
                    errors: [data.message],
                })
            }
            else
            {
                this.setState({
                    ...this.state,
                    errors: [],
                    message: 'Vous pouvez vous connecter avec ' + data.email,
                })
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
        

        // fetch('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1e04d51b2dadcbb6205da4b8d442c8f9aae0d7d6ac3a5becd2e51ed51727f967&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code', {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': 'Bearer 498a3c5fb66b92b5ec1f23700fbf1165f635bebb3b21b0a5b51f647e10645d84',
        //         'Access-Control-Allow-Origin': '*',
        //     },
        //     //body: JSON.stringify(postData),
        // })
        // .then(response => {
        //     // if (!response.ok) {
        //     //     throw new Error('Erreur de réseau : ' + response.status);
        //     // }
        //     return response.json();
        // })
        // .then(data => {
        //     //console.log(data);
            
        //     fetch('https://api.intra.42.fr/v2/me', {
        //         method: 'GET',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': 'Bearer 498a3c5fb66b92b5ec1f23700fbf1165f635bebb3b21b0a5b51f647e10645d84',
        //             'Access-Control-Allow-Origin': '*', 
        //         },
        //         //body: JSON.stringify(postData),
        //     })
        //     .then(response => {
        //         // if (!response.ok) {
        //         //     throw new Error('Erreur de réseau : ' + response.status);
        //         // }
        //         return response.json();
        //     })
        //     .then(data => {
        //         console.log(data);
                
    
        //     })
        //     .catch(error => {
        //         console.error('There was a problem with your fetch operation:', error);
        //     });

        // })
        // .catch(error => {
        //     console.error('There was a problem with your fetch operation:', error);
        // });
    }

    render() {
        return (
            <div id="sign-up">
                <div className="container">
                    <h1>
                        <span className="title-1">Transcendance</span>
                        <span className="title-2">Sign Up</span>
                    </h1>
                    <div className="form">
                        <form onSubmit={this.handleOnSubmit}>
                            <div className="row">
                                <label htmlFor="login_42">Login 42</label>
                                <input type="text" name="login_42" value={this.state.login_42} onChange={this.handleInputChange} placeholder="joe22" />
                            </div>
                            <div className="row">
                                <label htmlFor="username">Username</label>
                                <input type="text" name="username" value={this.state.username} onChange={this.handleInputChange} placeholder="joe22" />
                            </div>
                            <div className="row">
                                <label htmlFor="email">Email</label>
                                <input type="email" name="email" value={this.state.email} onChange={this.handleInputChange} placeholder="joe@example.com" />
                            </div>
                            <div className="row">
                                <label htmlFor="password">Password</label>
                                <input type="password" name="password" value={this.state.password} onChange={this.handleInputChange} placeholder="********" />
                            </div>
                            <div className="row">
                                <label htmlFor="password_confirmation">Password - Confirmation</label>
                                <input type="password" name="password_confirmation" value={this.state.password_confirmation} onChange={this.handleInputChange} placeholder="********" />
                            </div>
                            <div className="row">
                                <button type="submit">Sign Up</button>
                            </div>
                            <div className="errors">
                            {this.state.errors.map((error: any, index: any) => (
                                <div key={index} className="error">{error}</div>
                            ))}
                            </div>
                            <div className="message">
                                <p>{ this.state.message }</p>
                                <a href="/sign-in">you can you connect to the page</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
