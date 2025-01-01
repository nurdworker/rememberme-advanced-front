// store.ts
import { configureStore } from "@reduxjs/toolkit";

// initial data
const initialState = {
  mode: {
    isSign: false,
    isLoading: false,
    isAlert: false,
    isFetching: false,
    isMobile: false,
  },
  alertMessage: null,
  userInfo: null,
  data: { lists: [], words: [] },
};

// reducer
const appReducer = (state = initialState, action: any) => {
  switch (action.type) {
    // set data

    case "SET_DATA_LISTS":
      return { ...state, data: { ...state.data, lists: action.value } };
    case "SET_DATA_WORDS":
      return { ...state, data: { ...state.data, words: action.value } };

    // set auth
    case "SET_USER_INFO":
      return {
        ...state,
        userInfo: action.value,
        mode: {
          ...state.mode,
          isSign: Boolean(action.value),
        },
      };
    case "SET_SIGN":
      return {
        ...state,
        mode: {
          ...state.mode,
          isSign: action.value,
        },
      };
    // set mode state
    case "SET_LOADING":
      return {
        ...state,
        mode: {
          ...state.mode,
          isLoading: action.value,
        },
      };
    case "SET_FETCHING":
      return {
        ...state,
        mode: {
          ...state.mode,
          isFetching: action.value,
        },
      };
    case "SET_ALERT":
      return {
        ...state,
        mode: {
          ...state.mode,
          isAlert: action.value,
        },
      };
    case "SET_ALERT_MESSAGE":
      return {
        ...state,
        alertMessage: action.message,
      };
    case "SET_MOBILE":
      return {
        ...state,
        mode: {
          ...state.mode,
          isMobile: action.value,
        },
      };

    default:
      return state;
  }
};

export const store = configureStore({
  reducer: appReducer,
});
