// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { ReduxState, List, Word, UserInfo } from "./types/index";
//type
type Action =
  | { type: "SET_DATA_LISTS"; value: List[] }
  | { type: "SET_DATA_WORDS"; value: Word[] }
  | { type: "SET_USER_INFO"; value: UserInfo }
  | { type: "SET_SIGN"; value: boolean }
  | { type: "SET_LOADING"; value: boolean }
  | { type: "SET_FETCHING"; value: boolean }
  | { type: "SET_FETCHED_LISTS_DATA"; value: boolean }
  | { type: "SET_ALERT"; value: boolean }
  | { type: "SET_MOBILE"; value: boolean }
  | { type: "SET_ALERT_MESSAGE"; message: string | null };

// initial data
const initialState: ReduxState = {
  mode: {
    isSign: false,
    isLoading: false,
    isAlert: false,
    isFetching: false,
    isMobile: false,
    isFetchedListsData: false,
  },
  alertMessage: null,
  userInfo: null,
  data: { lists: [], words: [] },
};

// reducer
const appReducer = (state = initialState, action: Action) => {
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
    case "SET_FETCHED_LISTS_DATA":
      return {
        ...state,
        mode: {
          ...state.mode,
          isFetedListsData: action.value,
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
