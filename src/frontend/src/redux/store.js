import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './deviceReducer';
import detailsReducer from './detailsReducer';

const store = configureStore({
  reducer: {
    devices: deviceReducer,
    details: detailsReducer
  },
});

export default store;