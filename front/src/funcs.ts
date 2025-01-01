// public modules
import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";

// custom
import { auth } from "./auth";
import { staticData } from "./staticData";

// type
interface List {
  _id: string;
  name: string;
  creation_date: string;
  language: string;
  linked_incorrect_word_lists: any[];
  is_bookmark: boolean;
  user_id: string;
  is_deleted: boolean;
}

export const useFuncs = () => {
  // default
  const dispatch = useDispatch();
  const existingWords = useSelector((state: any) => state.data.words);

  const isFetchingWordsProcessing = useRef(false);
  const isFetchingListsProcessing = useRef(false);

  // shared funcs
  const showAlert = (message: string): void => {
    console.log("Dispatching SET_ALERT");
    dispatch({ type: "SET_ALERT", value: true });
    console.log("Dispatching SET_ALERT_MESSAGE");
    dispatch({ type: "SET_ALERT_MESSAGE", message });
    setTimeout(() => {
      console.log("Hiding alert");
      dispatch({ type: "SET_ALERT", value: false });
    }, 3000);
  };

  return {
    sendApiToEditWords: async (wordsArr: Array<object>): Promise<any> => {
      try {
        if (wordsArr.length === 0) {
          return Promise.resolve("No words to update.");
        }

        dispatch({ type: "SET_LOADING", value: true });

        const filteredWordsArr = wordsArr.map((word: any) => {
          const { user_id, creation_date, ...filteredWord } = word;
          return filteredWord;
        });

        console.log("Filtered Words (압축된 데이터):", filteredWordsArr);

        const response = await auth.api.post(
          `${staticData.endpoint}/words?request=editWords`,
          { words: filteredWordsArr }
        );

        console.log(response);

        if (response.status === 200 || response.status === 201) {
          return Promise.resolve(response);
        }
      } catch (error) {
        console.error("API 요청 실패:", error);
        showAlert("Failed to update words.");
        return Promise.reject(error);
      } finally {
        console.log("큐처리 끝났어!");
        dispatch({ type: "SET_LOADING", value: false });
      }
    },
    sendApiToEditLists: async (listsArr: Array<object>): Promise<any> => {
      try {
        if (listsArr.length === 0) {
          return Promise.resolve("No lists to update.");
        }

        dispatch({ type: "SET_LOADING", value: true });

        const filteredListsArr = listsArr.map((list: any) => {
          const { creation_date, language, user_id, ...filteredList } = list;
          return filteredList;
        });

        console.log("Filtered Lists (압축된 데이터):", filteredListsArr);

        const response = await auth.api.post(
          `${staticData.endpoint}/lists?request=editLists`,
          { lists: filteredListsArr }
        );

        if (response.status === 200 || response.status === 201) {
          return Promise.resolve(response);
        }
      } catch (error) {
        console.error("API 요청 실패:", error);
        showAlert("Failed to update lists.");
        return Promise.reject(error);
      } finally {
        console.log("큐처리 끝났어!");
        dispatch({ type: "SET_LOADING", value: false });
      }
    },
    changeUserInfo: (userInfo: any) => {
      console.log("change user info");
      dispatch({ type: "SET_USER", value: userInfo });
    },
    logOut: () => {
      console.log("log out");
      dispatch({ type: "SET_USER", value: null });
      dispatch({ type: "SET_DATA", value: null });
      localStorage.clear();
    },

    fetchWordsData: useCallback(
      async (list_id: string | undefined) => {
        if (isFetchingWordsProcessing.current) {
          console.log("fetching words is already running. return.");
          return { message: "processing" };
        }
        isFetchingWordsProcessing.current = true;
        console.log("Invoke fetching words!");

        dispatch({
          type: "SET_LOADING",
          value: true,
        });
        dispatch({
          type: "SET_FETCHING",
          value: true,
        });

        try {
          console.log("Fetching words data for list: ", list_id);

          const response = await auth.api.post(
            `${staticData.endpoint}/words?request=getWords`,
            { list_id }
          );

          console.log("Words fetched successfully:", response?.data);

          if (response?.data.answer.words) {
            const wordsFromApi = response.data.answer.words;
            if (!wordsFromApi || wordsFromApi.length === 0) {
              console.log("No words fetched.");
              return { message: "success" };
            }

            const newWords = wordsFromApi.filter(
              (newWord: any) =>
                !existingWords.some((word: any) => word._id === newWord._id)
            );

            const updatedWords = [...existingWords, ...newWords];
            if (newWords.length > 0) {
              dispatch({
                type: "SET_DATA_WORDS",
                value: updatedWords,
              });
            }
          }
          return { message: "success" };
        } catch (error) {
          const axiosError = error as AxiosError;
          alert(
            "Error connecting to getWords: " +
              JSON.stringify(axiosError.response?.data || axiosError.message)
          );
          return { message: "error" };
        } finally {
          dispatch({
            type: "SET_LOADING",
            value: false,
          });
          dispatch({
            type: "SET_FETCHING",
            value: false,
          });
          // empty javascript's task queue then change flag
          setTimeout(() => {
            isFetchingWordsProcessing.current = false;
          }, 0);
        }
      },
      [dispatch, existingWords]
    ),

    fetchListsData: useCallback(async () => {
      if (isFetchingListsProcessing.current) {
        console.log("fetching lists is already running. return.");
        return { message: "processing" };
      }
      isFetchingListsProcessing.current = true;
      dispatch({
        type: "SET_LOADING",
        value: true,
      });
      dispatch({
        type: "SET_FETCHING",
        value: true,
      });

      try {
        console.log("Fetching lists data...");

        const response = await auth.api.get(
          `${staticData.endpoint}/lists?request=getLists`
        );

        if (response?.data.answer.lists) {
          const fetchedLists = response.data.answer.lists;

          if (!fetchedLists || fetchedLists.length === 0) {
            console.log("No lists fetched. Skipping state update.");
            return { message: "success" };
          }

          const savedOrder = JSON.parse(
            localStorage.getItem("reorderedLists") || "[]"
          );

          const reorderedLists = savedOrder
            .map((id: string) =>
              fetchedLists.find((list: List) => list._id === id)
            )
            .filter((list: List | undefined) => list !== undefined) as List[];

          const newLists = fetchedLists.filter(
            (list: List) => !savedOrder.includes(list._id)
          );

          const finalLists = [...reorderedLists, ...newLists];

          dispatch({
            type: "SET_DATA_LISTS",
            value: finalLists,
          });

          const finalIds = finalLists.map((list) => list._id);
          localStorage.setItem("reorderedLists", JSON.stringify(finalIds));
          return { message: "success" };
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        alert(
          "Error connecting to getLists: " +
            JSON.stringify(axiosError.response?.data || axiosError.message)
        );
        return { message: "error" };
      } finally {
        isFetchingListsProcessing.current = false;
        dispatch({
          type: "SET_LOADING",
          value: false,
        });
        dispatch({
          type: "SET_FETCHING",
          value: false,
        });
      }
    }, [dispatch]),

    showAlert,
  };
};
