import types from '../actions/types';

const INITIAL_STATE = {
  projects: [],
  draftProjects: [],
  sellHistories: [],
  clients: [],
  suppliers: [],
  parts: [],
  orders: [],
  devices: [],

  brands: [],
  models: [],
  carts: [],
  tempDevices: [],
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.main.DATA_LOADED:
      return { ...state, [action.key]: action.payload };
    case types.main.ITEM_CREATED:
      return { ...state, [action.key]: [...state[action.key], action.payload] };
    default:
      return state;
  }
}
