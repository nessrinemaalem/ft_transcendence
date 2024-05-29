// gameReducer.ts
export interface GameState 
{
    game_history: any | null
    game_options: any | null
    game_load_once: boolean
    game_is_player: boolean
}

const initialChatState: GameState = {
    game_history: null,
    game_options: null,
    game_load_once: false,
    game_is_player: false,
}

type SetGameHistoryAction = { type: 'SET_GAME_HISTORY'; payload: any };
type SetGameOptionsAction = { type: 'SET_GAME_OPTIONS'; payload: any };
type SetGameAction = { type: 'SET_GAME'; payload: Partial<GameState> };


type GameAction = SetGameHistoryAction | SetGameOptionsAction | SetGameAction;

export const gameReducer = (state: GameState = initialChatState, action: GameAction): GameState => {
    switch (action.type) 
    {
        case 'SET_GAME_HISTORY':
            return {
                ...state,
                game_history: action.payload,
            };
        case 'SET_GAME_OPTIONS':
                return {
                    ...state,
                    game_options: action.payload,
                };
        case 'SET_GAME':
            return {
                ...state,
                ...action.payload,
            };
        default:
            return state;
    }
};
