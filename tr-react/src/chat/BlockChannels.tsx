import React from 'react'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faEllipsis, faTimes, faPlus, faTrash, faUsers, faKey, faLock, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { setChannels, setChannelsCurrent, setMessages, setMessagesUser } from '../store/actions';
import SOCKET_ONCE from '../SocketCustom';

import './sass/main.sass'
import { channel } from 'diagnostics_channel';

interface BlockChannelsState
{
    toolsStyle: any
    toolsIsSelected: boolean
    formCreateSelected: boolean
    formEditSelected: boolean
    isJoinConfirmSelected: boolean
    toolsData: any

    name: any
    password: any
    password_join: any
    privacy: any
}

interface BlockChannelsProps
{
    user: any
    channels: any
    channels_current: any
    setChannels: (data: any) => void
    setChannelsCurrent: (data: any) => void
    setMessages: (data: any) => void

}

class BlockChannels extends React.Component<BlockChannelsProps, BlockChannelsState>
{
    refTools: any

    constructor(props: any)
    {
        super(props)
        this.state = {
            toolsStyle: {},
            toolsIsSelected: false,
            toolsData: null,
            formCreateSelected: false,
            formEditSelected: false,
            isJoinConfirmSelected: false,
            name: '',
            password: '',
            password_join: '',
            privacy: '',
        }

        this.refTools = React.createRef()

        SOCKET_ONCE._socket.on('c-channels', (data: any) => {
            console.log('socket channels ...', data)
            this.props.setChannels(data.channels)
        });

        SOCKET_ONCE._socket.on('c-channels-join', (data: any) => {
            console.log('socket channels join ...', data)
            this.props.setChannelsCurrent(data.channel)
        });

        SOCKET_ONCE._socket.on('c-channels-leave', (data: any) => {
            console.log('socket channels leave ...', data)
            this.props.setChannelsCurrent(null)
            this.props.setMessages([])
        });

        // if deconnect & connect
        SOCKET_ONCE.onConnectChatChannels = () => {
            console.log('BlockChannels socket onConnectChatChannels ...')
            SOCKET_ONCE._socket.emit('c-channels', { });
        }

        SOCKET_ONCE.onDisconnectChatChannels = () => {
            SOCKET_ONCE._socket.emit('c-channels-leave', { channel: this.props.channels_current });
        }
    }

    componentDidMount(): void 
    {
        console.log('BlockChannels componentDidMount ...')
        SOCKET_ONCE._socket.emit('c-channels', { });
    }

    // -- HANDLER

    handleOnOptions(event: any, toolsData: any)
    {
        
        const element = event.currentTarget
        const objetRect = element.getBoundingClientRect() //button
        
        console.log('tools', toolsData)

        const objectRectClient = this.refTools.current.getBoundingClientRect()
        
        const style = {
            display: 'block',
            top: objetRect.top + 'px',
            right: (window.innerWidth - objetRect.left) + 'px',
        }
        this.setState({
            ...this.state,
            toolsStyle: style,
            toolsIsSelected: true,
            toolsData: toolsData,
        })

    }

    handleBlockToolsOnClick()
    {
        this.setState({
            ...this.state,
            toolsIsSelected: false,
        })
    }

    handleAddEditOnClick()
    {
        this.setState({
            ...this.state,
            formCreateSelected: !this.state.formCreateSelected,
        })
    }

    handleCreateOnClick()
    {
        // save database
        this.setState({
            ...this.state,
            formCreateSelected: !this.state.formCreateSelected,
            formEditSelected: false,
        })
    }

    handleJoinOnClick(event: any)
    {
        event.stopPropagation();
        // save database
        this.setState({
            ...this.state,
            isJoinConfirmSelected: true,
            toolsIsSelected: false,
        }, () => console.log(this.state.formEditSelected))
    }

    handleEditOnClick(event: any)
    {
        event.stopPropagation();

        
        // save database
        this.setState({
            ...this.state,
            formCreateSelected: false,
            formEditSelected: true,
            toolsIsSelected: false,
        }, () => console.log(this.state.formEditSelected))
    }

    handleDeleteOnClick(event: any)
    {
        event.stopPropagation();
        // save database

        const { channel_id } = this.state.toolsData;

        console.log('delete ... ', channel_id)

        const url = `/chat/channels/${channel_id}/destroy`
        let postData = {
        }

        //console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*', 
            },
            //body: JSON.stringify(postData),
        })
        .then(response => {
            // if (!response.ok) {
            // throw new Error('Network response was not ok');
            // }
            return response.json();
        })
        .then(data => {

            console.log(data);
            if (data.channel)
                SOCKET_ONCE._socket.emit('c-channels', { });
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

        this.setState({
            ...this.state,
            toolsIsSelected: false,
        }, () => console.log(this.state.formEditSelected))
    }

    handleJoinConfirmCloseOnClick()
    {
        //event.stopPropagation();
        // save database
        this.setState({
            ...this.state,
            isJoinConfirmSelected: false,
        })
    }

    handleJoinConfirmJoinOnClick(event: any)
    {
        event.preventDefault();
        const { channel_id, 
            channel_name, channel_password, 
            channel_privacy 
        } = this.state.toolsData;
        const { password_join } = this.state;


        console.log('join ...', 
            channel_id, channel_name, 
            channel_password, channel_privacy,
            password_join,
        )

        const url = `/chat/channels/${channel_id}/join`
        let postData = {
            user_id: this.props.user.id,
            password: password_join,
        }

        console.log(postData, JSON.stringify(postData))
        
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

            console.log('joined ...', data);
            // laveve previous if needed ...
            // if (data.channel)
            // {
            //     SOCKET_ONCE._socket.emit('c-join-channel', { 
            //         channel_id: data.channel.id
            //     });
            //     this.props.setChannelsCurrent(data.channel)
            // }
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

        this.setState({
            ...this.state,
            isJoinConfirmSelected: false,
        })
    }

    // -- HANDLE FORM CREATE - EDIT

    handleInputChange = (event: any)=> {
        const { name, value } = event.target;
        this.setState({
            ...this.state,
            [name]: value
        });
    };

    handleFormCreateOnStore = (event: any) => {
        event.preventDefault();
        const { name, password, privacy } = this.state;

        console.log(name, password, privacy)

        const url = `/chat/channels/store`
        let postData = {
            name: name,
            password: password,
            privacy: parseInt(privacy) ? parseInt(privacy) : 0,
            owner_id: this.props.user.id,
        }

        console.log(postData, JSON.stringify(postData))
        
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
            
            if (data.channel)
                SOCKET_ONCE._socket.emit('c-channels', { });
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    handleUpdateInputChange = (event: any)=> {
        const { name, value } = event.target;
        this.setState({
            ...this.state,
            toolsData: {
                ...this.state.toolsData,
                [name]: name === 'channel_privacy' ? parseInt(value) : value
            }
        });
    };

    handleFormCreateOnUpdate = (event: any) => {
        event.preventDefault();
        const { channel_id, 
            channel_name, channel_password, 
            channel_privacy 
        } = this.state.toolsData;

        console.log('edit ...', 
            channel_id, channel_name, 
            channel_password, channel_privacy
        )

        const url = `/chat/channels/${channel_id}/update`
        let postData = {
            name: channel_name,
            password: channel_password,
            privacy: parseInt(channel_privacy) ? parseInt(channel_privacy) : 0,
        }

        console.log(postData, JSON.stringify(postData))
        
        fetch(url, {
            method: 'PUT',
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
            
            if (data.channel)
                SOCKET_ONCE._socket.emit('c-channels', { });
           
            // other actions ...
            // ex: update vue
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }


    // -- RENDER

    renderFormCreate()
    {
        return (
            <div className="form form-create">                    
                <div className="row">
                    <label htmlFor="create_name">Name</label>
                    <input type="text" id="create_name" name="name" value={this.state.name} onChange={this.handleInputChange} />
                </div>
                <div className="row">
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" onChange={this.handleInputChange} />
                </div>
                <div className="row rp">
                    <h6>Privacy</h6>
                    <div className="rp-options">
                        <label>
                            <input type="radio" name="privacy" value="0" checked={this.state.privacy === '0'} onChange={this.handleInputChange} />
                            Public
                        </label>
                        <label>
                            <input type="radio" name="privacy" value="1" checked={this.state.privacy === '1'} onChange={this.handleInputChange} />
                            Private
                        </label>

                        <label>
                            <input type="radio" name="privacy" value="2" checked={this.state.privacy === '2'} onChange={this.handleInputChange} />
                            Protected
                        </label>
                    </div>
                </div>
                <div className="row">
                    <button onClick={this.handleFormCreateOnStore}>CREATE</button>
                </div>
            </div> 
        )
    }
   
    renderFormEdit()
    {
        return (
            <div className="form form-edit">                    
                <div className="row">
                    <label htmlFor="edit_name">Name</label>
                    <input type="text" id="edit_name" name="channel_name" value={this.state.toolsData ? this.state.toolsData.channel_name : ''} onChange={this.handleUpdateInputChange} />
                </div>
                <div className="row">
                    <label htmlFor="password">Password</label>
                    <input type="password" name="channel_password" onChange={this.handleUpdateInputChange} />
                </div>
                <div className="row rp">
                    <h6>Privacy</h6>
                    <div className="rp-options">
                        <label>
                            <input type="radio" name="channel_privacy" value="0" checked={this.state.toolsData ? this.state.toolsData.channel_privacy === 0 : false} onChange={this.handleUpdateInputChange} />
                            Public
                        </label>
                        <label>
                            <input type="radio" name="channel_privacy" value="1" checked={this.state.toolsData ? this.state.toolsData.channel_privacy === 1 : false} onChange={this.handleUpdateInputChange} />
                            Private
                        </label>
                        <label>
                            <input type="radio" name="channel_privacy" value="2" checked={this.state.toolsData ? this.state.toolsData.channel_privacy === 2 : false} onChange={this.handleUpdateInputChange} />
                            Protected
                        </label>
                    </div>
                </div>
                <div className="row">
                    <button onClick={this.handleFormCreateOnUpdate}>EDIT</button>
                </div>
            </div>
        );
    }

    renderChannelsPrivacy(type: number)
    {
        if (type === 0)
            return (<FontAwesomeIcon icon={ faGlobe } />)
        else if (type === 1)
            return (<FontAwesomeIcon icon={ faLock } />)
        else if (type === 2)
            return (<FontAwesomeIcon icon={ faKey } />)
    }

    renderChannels()
    {
        const elements = []
        for (let index = 0; index < this.props.channels.length; index++) 
        {
            const channel = this.props.channels[index]

            elements.push((
                <div className="channel" key={ channel.channel_id }>
                    <div className="privacy">
                        { this.renderChannelsPrivacy(channel.channel_privacy) }
                    </div>
                    <div className="name">#{ channel.channel_name }</div>
                    <div className="users">
                        <FontAwesomeIcon icon={ faUsers } />
                        <div className="value">{ channel.members_total }</div>
                    </div>
                    <button onClick={ (event: any) => this.handleOnOptions(event, channel) }>
                        <FontAwesomeIcon icon={ faEllipsis } />
                    </button>
                </div>
            ))
        }

        return elements
    }


    renderTools()
    {
        return (
            <div className={ 'block-tools' + (this.state.toolsIsSelected ? ' selected' : '') } ref={ this.refTools }
                onClick={ () => this.handleBlockToolsOnClick() }>
                <div className="bt-container" style={ this.state.toolsStyle }>
                    <button onClick={ (event) => this.handleJoinOnClick(event) }>Join</button>
                    {this.state.toolsData && this.state.toolsData.channel_owner_id === this.props.user.id &&
                        (
                            <>
                                <button onClick={ (event) => this.handleEditOnClick(event) }>Edit</button>
                                <button onClick={ (event) => this.handleDeleteOnClick(event) }>Delete</button>
                            </>
                        )
                    }
                </div>
            </div>
        )
    }

    renderJoinConfirm()
    {
        return (
            <div className={ 'join-confirm' + (this.state.isJoinConfirmSelected ? ' selected' : '') }>
                <div className="jc-close">
                    <button onClick={ () => this.handleJoinConfirmCloseOnClick() }>
                        <FontAwesomeIcon icon={ faTimes } />
                    </button>
                </div>
                <div className="jc-info">
                    <div className="privacy">
                        { this.renderChannelsPrivacy( this.state.toolsData ? this.state.toolsData.channel_privacy : 0) }
                    </div>
                    <h6 className="name">#{ this.state.toolsData ? this.state.toolsData.channel_name : '---' }</h6>
                    <div className="users">
                        <FontAwesomeIcon icon={ faUsers } />
                        <div className="value">{ this.state.toolsData ? this.state.toolsData.members_total : 0 }</div>
                    </div>
                </div>

                <div className="jc-form form">
                    <div className="row">
                        <label htmlFor="">Password</label>
                        <input type="password" name="password_join" value={this.state.password_join} onChange={this.handleInputChange} />
                    </div>
                    <div className="row">
                        <button onClick={ (event: any) => this.handleJoinConfirmJoinOnClick(event) }>JOIN</button>
                    </div>
                </div>  

            </div>
        )
    }

    render()
    {
        return (
            <>

                <div className={'block-add-edit' 
                    + (this.state.formCreateSelected ? ' selected create' : '') 
                    + (this.state.formEditSelected ? ' selected edit' : '')
                    }>
                    <div className="options">
                        <button className="btn-add" onClick={ () => this.handleCreateOnClick() }>
                            <FontAwesomeIcon icon={ faPlus } />
                        </button>
                        {/* <button onClick={ () => this.handleCreateOnClick() }>
                            LEAVE
                        </button> */}
                    </div>
                    { this.renderFormCreate() }
                    { this.renderFormEdit() }
                </div>

                <div className="block-list">
                    { this.renderChannels() }
                </div>

                { this.renderTools() }

                { this.renderJoinConfirm() }

            </>
        )
    }

}

const mapStateToProps = (state: any) => ({
    user: state.auth.user,
    channels: state.chat.channels,
    channels_current: state.chat.channels_current,
});

const mapDispatchToProps = {
    setChannels,
    setChannelsCurrent,
    setMessages,
    setMessagesUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(BlockChannels);