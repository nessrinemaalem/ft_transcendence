// userReducer.ts
export interface UserState {
    name: string;
    email: string;
}

const initialUserState: UserState = {
    name: '',
    email: ''
};

type UserAction = { type: 'SET_USER'; payload: { name: string; email: string } };

export const userReducer = (state: UserState = initialUserState, action: UserAction): UserState => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, name: action.payload.name, email: action.payload.email };
        default:
            return state;
    }
};
