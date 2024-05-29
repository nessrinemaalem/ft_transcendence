import React, { ChangeEvent, KeyboardEvent } from 'react';
import { connect } from 'react-redux';
import { setUser, signIn, setMessages } from '../store/actions';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

import './sass/main.sass';

interface SignInState {
    email: any
    password: any
    inputs: any
    isCodeVivible: boolean
}

interface SignInProps 
{
    setUser: (data: any) => void
    signIn: (data: any) => void
}

class SignIn extends React.Component<SignInProps, SignInState> 
{
    refForm: any = null
    inputRefs: any = null

    constructor(props: any)
    {
        super(props)
        this.state = {
            email: '',
            password: '',
            inputs: ['', '', '', '', '', ''],
            isCodeVivible: false,
        }
        this.refForm = React.createRef()
        this.inputRefs = Array.from({ length: 6 }, () => React.createRef());
    }


    componentDidMount(): void {
        
        console.log('SignIn componentDidMount ...')

        const urlParams = new URLSearchParams(window.location.search)
        const codeParam = urlParams.get('code')
        if (codeParam)
        {
            this.handle42SignUpOnSubmit(codeParam)
            console.log(codeParam);
        }

    }

    handleOnSubmit() 
    {
        // this.props.setUser('John Doe', 'john@example.com')
        // this.props.signIn()

        let postData = {
            email: this.refForm.current.querySelector('input[name="email"]').value,
            password: this.refForm.current.querySelector('input[name="password"]').value,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch('/sign-in', {
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
            if (data.code)
            {
                this.setState({
                    ...this.state,
                    email: postData.email,
                    isCodeVivible: !this.state.isCodeVivible
                })
            }
            else if (data.user && data.user.id)
            {
                console.log(document.cookie)
                //this.props.setUser(data)
                this.props.signIn(data.user)
            }
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handle42SignUpOnSubmit(code: any)
    {
        const url = `/sign-up-42?code=${code}`
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {
            console.log(data);

            if (data.code)
            {
                this.setState({
                    ...this.state,
                    email: data.email,
                    isCodeVivible: !this.state.isCodeVivible
                })
            }
            else if (data.user && data.user.id)
            {
                console.log(document.cookie)
                //this.props.setUser(data)
                this.props.signIn(data.user)
            }
        
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }


    handle42OnSubmit()
    {
  
        fetch('/sign-in-42', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {
            console.log(data);
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleInputChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const inputs = [...this.state.inputs];
        inputs[index] = value;
        this.setState({ inputs }, () => {
            const nextIndex = index + 1;
            if (nextIndex < this.inputRefs.length && value !== '') {
                this.inputRefs[nextIndex].current?.focus();
            }
            const allInputsFilled = this.state.inputs.every((input: any) => input !== '');
            if (allInputsFilled) {
                const code = this.state.inputs.join('');
                let postData = {
                    email: this.refForm.current.querySelector('input[name="email"]').value,
                    code: code,
                }
        
                console.log(postData, JSON.stringify(postData))
                
                fetch('/sign-in-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Access-Control-Allow-Origin': '*', 
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
                    
                    if (data.id)
                    {
                        //this.props.setUser(data)
                        this.props.signIn(data)
                    }
                   
                    // other actions ...
                    // ex: update vue
                })
                .catch(error => {
                    console.error('There was a problem with your fetch operation:', error);
                });

                console.log('Tous les champs sont remplis');
            } else {
                console.log('Veuillez remplir tous les champs');
            }
        });
    }

    handleInputKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget;
        const previousIndex = index - 1;
        if ((event.key === 'Backspace' || event.key === 'Delete') && value === '') {
            if (previousIndex >= 0) {
                this.inputRefs[previousIndex].current?.focus();
            }
        }
    }

    renderCode() 
    {
        return (
            <div className="code">
                {this.state.inputs.slice(0, 3).map((value: any, index: any) => (
                    <input
                        key={index}
                        type="text"
                        placeholder="-"
                        maxLength={1}
                        value={value}
                        onChange={(event) => this.handleInputChange(index, event)}
                       
                        ref={this.inputRefs[index]}
                    />
                ))}
                <div>-</div>
                {this.state.inputs.slice(3).map((value: any, index: any) => (
                    <input
                        key={index + 3}
                        type="text"
                        placeholder="-"
                        maxLength={1}
                        value={value}
                        onChange={(event) => this.handleInputChange(index + 3, event)}
                        
                        ref={this.inputRefs[index + 3]}
                    />
                ))}
            </div>
        );
    }

    render() {
        return (
            <div id="sign-in">
                <div className="container">
                    <h1>
                        <span className="title-1">Transcendance</span>
                        <span className="title">Sign In</span>
                    </h1>
                    <div className="form">
                        <form ref={ this.refForm }>
                            <div className="row">
                                <label htmlFor="email">Email</label>
                                <input type="email" name="email" placeholder="joe@example.com" />
                                <div className="error">Need email</div>
                            </div>
                            <div className="row">
                                <label htmlFor="password">Password</label>
                                <input type="password" name="password" placeholder="••••••••" />
                                <div className="error">Need email</div>
                            </div>
                            <div className="row">
                                <button type="button"
                                    onClick={() => {
                                        this.handleOnSubmit();
                                        // Rediriger vers la route '/'
                                        return <Navigate to="/" />;
                                    }}>Sign In</button>
                                {/* <button type="button"
                                    onClick={() => {
                                        this.handle42OnSubmit();
                                        // Rediriger vers la route '/'
                                        return <Navigate to="/" />;
                                    }}>42</button> */}
                                    <Link className="btn-42" to={ "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1e04d51b2dadcbb6205da4b8d442c8f9aae0d7d6ac3a5becd2e51ed51727f967&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2F&response_type=code" }>42</Link>
                            </div>
                            <div className="row r-new">
                                <a href="/sign-up">Vous n'avez pas de compte ?</a>
                            </div>
                            <div className={ 'row r-code' + (this.state.isCodeVivible ? ' visible' : '')}>
                                <p>Write the code we sent to you.</p>
                                { this.renderCode() }
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {
    setUser,
    signIn,
};

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
