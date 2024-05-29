// actions.ts

export const setUser = (data: any): { type: 'SET_USER'; payload: { data: any } } => ({
    type: 'SET_USER',
    payload: { data }
});

export const signIn = (user: any): { type: 'SIGN_IN'; payload: { user: any } } => ({
    type: 'SIGN_IN',
    payload: { user }
});

export const signOut = (): { type: 'SIGN_OUT' } => ({
    type: 'SIGN_OUT'
});

export const setChannels = (channels: any[]): { type: 'SET_CHANNELS'; payload: any[] } => ({
    type: 'SET_CHANNELS',
    payload: channels
});

export const setMessages = (messages: any[]): { type: 'SET_MESSAGES'; payload: any[] } => ({
    type: 'SET_MESSAGES',
    payload: messages
});

export const setMessagesUser = (messages: any[]): { type: 'SET_MESSAGES_USER'; payload: any[] } => ({
    type: 'SET_MESSAGES_USER',
    payload: messages
});

export const setBlocks = (blocks: any[]): { type: 'SET_BLOCKS'; payload: any[] } => ({
    type: 'SET_BLOCKS',
    payload: blocks
});

// Ajout de l'action pour définir la propriété channels_current
export const setChannelsCurrent = (channelsCurrent: any): { type: 'SET_CHANNELS_CURRENT'; payload: any } => ({
    type: 'SET_CHANNELS_CURRENT',
    payload: channelsCurrent
});

export const setGameHistory = (gameCurrent: any): { type: 'SET_GAME_HISTORY'; payload: any } => ({
    type: 'SET_GAME_HISTORY',
    payload: gameCurrent
});

export const setGameOptions = (gameCurrent: any): { type: 'SET_GAME_OPTIONS'; payload: any } => ({
    type: 'SET_GAME_OPTIONS',
    payload: gameCurrent
});

export const setGame = (game: any): { type: 'SET_GAME'; payload: any } => ({
    type: 'SET_GAME',
    payload: game
});
