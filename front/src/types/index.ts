//public
export interface UserInfo {
  email: string;
  picture: string;
}

export interface List {
  _id: string;
  name: string;
  language: string;
  user_id: string;
  creation_date: string;
  linked_incorrect_word_lists: string[];
  is_deleted: boolean;
  is_bookmark: boolean;
}

export interface IncorrectList {
  _id: string;
  user_id: string;
  creation_date: string;
  linked_word_lists: string[];
}

export interface Word {
  _id: string;
  word: string;
  mean: string;
  memo: string;
  list_id: string;
  user_id: string;
  creation_date: string;
  is_deleted: boolean;
  is_incorrect: boolean;
  incorrect_lists: string[];
}

export interface TestingData {
  test_id: string;
  testLists: { list_id: string; isIncorrect: boolean }[];
  testMode: string;
  data: {
    nowIndex: number;
    listsData: List[];
    wordsData: Word[];
    optionData: string[][];
    correctOptionData: string[];
    chosenOptionData: (string | null)[];
  };
}

// redux
export interface ModeState {
  isSign: boolean;
  isLoading: boolean;
  isBlockLoading: boolean;
  isAlert: boolean;
  isFetching: boolean;
  isMobile: boolean;
  isFetchedListsData: boolean;
}

export interface DataState {
  lists: List[];
  words: Word[];
}

export interface ReduxState {
  mode: ModeState;
  alertMessage: string | null;
  userInfo: any | null;
  data: DataState;
}

// auth
export interface ClientData {
  clientId: string;
  redirectUri: string;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface SignResponse {
  authResponse: string;
  userInfo: UserInfo;
  tokens: Tokens;
}

export interface AuthData {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
}

// funcs
export type FetchDataReturn = { message: "processing" | "success" | "error" };

export interface Response {
  status: number;
  data: ResponseData;
}

export interface ResponseData {
  answer: any;
  authResponse: {
    message: string;
    tokens: { access_token: string; refresh_token: string };
  };
}

export interface FilteredWord extends Omit<Word, "user_id" | "creation_date"> {}
export interface FilteredList
  extends Omit<List, "user_id" | "creation_date" | "language"> {}
