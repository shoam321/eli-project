import { userTypes } from '../actions/types';

const INITIAL_STATE = {
  profile: {},
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case userTypes.USER_LOADED:
      return { ...state, profile: action.payload };
    default:
      return state;
  }
}
