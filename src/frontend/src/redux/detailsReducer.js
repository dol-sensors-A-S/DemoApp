import {
    FETCH_DETAILS_REQUEST,
    FETCH_DETAILS_SUCCESS,
    FETCH_DETAILS_FAILURE,
  } from './actionTypes';
  
  const initialState = {
    loading: false,
    details: null,
    error: '',
  };
  
  const detailsReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_DETAILS_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case FETCH_DETAILS_SUCCESS:
        return {
          loading: false,
          details: action.payload,
          error: '',
        };
      case FETCH_DETAILS_FAILURE:
        return {
          loading: false,
          details: [],
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default detailsReducer;