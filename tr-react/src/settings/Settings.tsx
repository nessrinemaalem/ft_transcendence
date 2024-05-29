import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import './sass/main.sass';

import { connect } from 'react-redux';
import { signIn, } from '../store/actions';


interface File {
  name: string;
  size: number;
}

interface SettingsState {
  files: any[];
}

interface SettingsProps 
{
  user: any
  signIn: (data: any) => void
}

class Settings extends Component<SettingsProps, SettingsState> {
  
  formUserRef: any = null
  
  constructor(props: SettingsProps) {
    super(props);
    this.state = {
      files: [],
    };

    this.formUserRef = React.createRef()
  }

  onDrop = (files: any[]) => {
    this.setState({ files }, () => {{
        this.handleAvatarUpdate()
    }});
    console.log('Fichiers sélectionnés:', files);
  };


  handleAvatarUpdate()
  {
    console.log(".... udpdate avatar ...",this.state.files)
    const formData = new FormData();
    formData.append('avatar', this.state.files[0]);

    const url = `/users/${ this.props.user.id }/update-avatar`
    fetch(url, {
        method: 'PATCH',
        body: formData,
    })
    .then(response => {
        // if (!response.ok) {
        //     throw new Error('Erreur de réseau : ' + response.status);
        // }
        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.user)
            this.props.signIn(data.user)
        
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

  }

  handleEmailUpdate()
  {
    console.log(".... udpdate email ...", this.formUserRef.current)
    const inputValue = this.formUserRef.current.querySelector('.r-email input').value
    const postData = {
        email: inputValue,
    };

    console.log(postData);


    const url = `/users/${ this.props.user.id }/update-email`
    fetch(url, {
        method: 'PATCH',
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
        if (data.user)
            this.props.signIn(data.user)
        
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
  }

  handlePasswordUpdate()
  {
    console.log(".... udpdate password ...", this.formUserRef.current)
    const inputValue = this.formUserRef.current.querySelector('.r-password input').value
    const inputValueConfirmation = this.formUserRef.current.querySelector('.r-confirmation input').value
    const postData = {
        password: inputValue,
        password_confirmation: inputValueConfirmation,
    };

    console.log(postData);
  
    
    const url = `/users/${ this.props.user.id }/update-password`
    fetch(url, {
        method: 'PATCH',
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
        this.props.signIn(data.user)
        
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
  }

  handleUsernameUpdate()
  {
    console.log(".... udpdate username ...", this.formUserRef.current)
    const inputValue = this.formUserRef.current.querySelector('.r-username input').value
    const postData = {
        username: inputValue,
    };

    console.log(postData);

    
    const url = `/users/${ this.props.user.id }/update-username`
    fetch(url, {
        method: 'PATCH',
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
        if (data.user)
            this.props.signIn(data.user)
        
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

  }

  handle2FAUpdate()
  {
    console.log(".... udpdate 2fa ...", this.formUserRef.current)
    //const inputValue = this.formUserRef.current.querySelector('.r-2fa input').value
    const postData = {
        is_2fa: this.props.user.is_2fa ? 0 : 1,
    };

    console.log(postData);

    
    const url = `/users/${ this.props.user.id }/update-2fa`
    fetch(url, {
        method: 'PATCH',
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
        if (data.user)
            this.props.signIn(data.user)
        
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
  }


  // --- RENDER 

  renderImages()
  {
    let avatar = 'https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp'
    if (this.props.user.avatar)
    {
        if (this.props.user.avatar.startsWith('https://'))
            avatar = this.props.user.avatar
        else
            avatar = '/' + this.props.user.avatar
    }

    return (
            <div className="form user-avatar">
            <div className="avatar">
                <img src={ avatar } />
                <Dropzone 
                    accept={ { 'image/png': ['.png'], } }
                    maxFiles={ 1 }
                    onDrop={this.onDrop}>
                {({ getRootProps, getInputProps }) => (
                    <button onClick={() => null}>
                        <section className="container">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                        +
                        </div>
                        </section>
                    </button>
                )}
                </Dropzone>
                
            </div>
            {/* <p className="message">Avatar updated!</p> */}
            </div>
        )
  }

  renderUsername()
  {
    return (
        <div className="form">
            <div className="row r-username">
                <div className="label">
                <label>Username</label>
                </div>
                <input type="text" defaultValue={ this.props.user.username } />
            </div>
            <div className="row">
                <button onClick={ () => this.handleUsernameUpdate() }>Update</button>
            </div>
            {/* <div className="error">Password error!</div>
            <div className="message">Update</div> */}
        </div>
    )
  }


  renderEmail()
  {
    return (
        <div className="form">
            <div className="row r-email">
                <div className="label">
                <label>Email</label>
                </div>
                <input type="email" defaultValue={ this.props.user.email } />
            </div>
            <div className="row">
                <button onClick={ () => this.handleEmailUpdate() } >Update</button>
            </div>
        </div>
    )
  }

  renderPassword()
  {
    return (
        <div className="form">
            <div className="row r-password">
                <div className="label">
                <label>Password</label>
                </div>
                <input type="password" />
            </div>
            <div className="row r-confirmation">
                <div className="label">
                <label>Password - Confirmation</label>
                </div>
                <input type="password" />
            </div>
            <div className="row">
                <button onClick={ () => this.handlePasswordUpdate() }>Update</button>
            </div>
        </div>
    )
  }

  render2fa()
  {
    return (
        <div className="form">
            <div className="row r-2fa">
                <div className="label">
                <label>2FA</label>
                </div>
            </div>
            <div className="row">
                <button
                    className={ this.props.user.is_2fa ? 'enabled' : ''  } 
                    onClick={ () => this.handle2FAUpdate() }>{ this.props.user.is_2fa ? 'Enabled' : 'Disabled' }</button>
            </div>
        </div>
    )
  }

  render() 
  {
    
    return (
        <div id="settings" ref={ this.formUserRef }>

            { this.renderImages() }

            { this.renderUsername() }

            { this.renderEmail()}
           
            { this.renderPassword() }
            
            { this.render2fa() }

        </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  user: state.auth.user,
});

const mapDispatchToProps = {
    signIn,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
