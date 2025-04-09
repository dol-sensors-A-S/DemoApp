import {
    FETCH_DEVICES_REQUEST,
    FETCH_DEVICES_SUCCESS,
    FETCH_DEVICES_FAILURE,
  } from './actionTypes';
  
  const initialState = {
    loading: false,
    devices: null,
    error: '',
  };
  
  const deviceReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_DEVICES_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case FETCH_DEVICES_SUCCESS:
        return {
          loading: false,
          devices: action.payload,
          error: '',
        };
      case FETCH_DEVICES_FAILURE:
        return {
          loading: false,
          devices: [],
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default deviceReducer;