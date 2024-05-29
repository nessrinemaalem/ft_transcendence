// store.ts
import { createStore } from 'redux';
import { combineReducers } from 'redux';
import { 
  authReducer, userReducer, 
  chatReducer, gameReducer 
} from './reducers';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  chat: chatReducer,
  game: gameReducer,
});

const store = createStore(rootReducer);

export default store;
