// authReducer.ts
export interface AuthState {
    isLoggedIn: boolean;
    user: any;
}

const initialAuthState: AuthState = {
    isLoggedIn: false,
    user: null,
};

type AuthAction = { type: 'SIGN_IN'; payload: { user: any } } 
    | { type: 'SIGN_OUT' };

export const authReducer = (state: AuthState = initialAuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SIGN_IN':
            return { ...state, isLoggedIn: true, user: action.payload.user };
        case 'SIGN_OUT':
            return { ...state, isLoggedIn: false, user: null };
        default:
            return state;
    }
};
