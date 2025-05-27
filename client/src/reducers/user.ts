import type User from '@/interfaces/user';
import type { UserAction } from '@/types/actions/user';

interface UserState {
  user: User | null;
}

export const initialState: UserState = {
  user: null
};

export function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    
    case 'UPDATE_USER':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    
    case 'CLEAR_USER':
      return {
        ...state,
        user: null
      };

    default:
      return state;
  }
}