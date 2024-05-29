// chatReducer.ts
export interface ChatState {
    channels: any[];
    channels_current: any | null;
    messages: any[];
    messages_user: any[];
    blocks: any[];
}

const initialChatState: ChatState = {
    channels: [],
    channels_current: null,
    messages: [],
    messages_user: [],
    blocks: [],
};

type SetChannelsAction = { type: 'SET_CHANNELS'; payload: any[] };
type SetMessagesAction = { type: 'SET_MESSAGES'; payload: any[] };
type SetMessagesUserAction = { type: 'SET_MESSAGES_USER'; payload: any[] };
type SetBlocksAction = { type: 'SET_BLOCKS'; payload: any[] };
type SetChannelsCurrentAction = { type: 'SET_CHANNELS_CURRENT'; payload: any };

type ChatAction = SetChannelsAction | SetMessagesAction | SetMessagesUserAction | SetBlocksAction | SetChannelsCurrentAction;

export const chatReducer = (state: ChatState = initialChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'SET_CHANNELS':
            return { 
                ...state, 
                channels: action.payload,
            };
        case 'SET_MESSAGES':
            return { 
                ...state, 
                messages: action.payload,
            };
        case 'SET_MESSAGES_USER':
                return { 
                    ...state, 
                    messages_user: action.payload,
                };
        case 'SET_BLOCKS':
            return { 
                ...state, 
                blocks: action.payload,
            };
        case 'SET_CHANNELS_CURRENT':
            return {
                ...state,
                channels_current: action.payload,
            };
        default:
            return state;
    }
};
