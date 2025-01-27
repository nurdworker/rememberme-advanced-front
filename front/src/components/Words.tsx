// public modules
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

// custom
import { useFuncs } from "../funcs";
import { useQueue } from "../QueueContext";
import { auth } from "../auth";
import { staticData } from "../staticData";

// css
import "./Words.scss";

// components
import WordBox from "./small/WordBox";
import CreateWordModal from "./small/CreateWordModal";

// icons
import { FaPlus, FaEdit } from "react-icons/fa";
import { FaRegEye, FaNoteSticky, FaRegEyeSlash } from "react-icons/fa6";
import { IoTrashBin, IoShuffle } from "react-icons/io5";
import { MdNoteAdd } from "react-icons/md";
import { SlNotebook } from "react-icons/sl";
import { RiArrowGoBackFill } from "react-icons/ri";
import { SiTestcafe } from "react-icons/si";

//types
import {
  ReduxState,
  Word,
  List,
  FetchDataReturn,
  IncorrectList,
} from "../types/index";
import { AxiosResponse } from "axios";

const Words = () => {
  // default
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { editedWordsQueue } = useQueue();
  const location = useLocation();

  // public data
  const { fetchWordsData, fetchListsData, showAlert } = useFuncs();
  const words: Word[] = useSelector(
    (state: ReduxState) => state.data.words || []
  );
  const lists: List[] = useSelector((state: ReduxState) => state.data.lists);

  // public mode
  const isFetching: boolean = useSelector(
    (state: ReduxState) => state.mode.isFetching
  );
  const isFetchedListsData: boolean = useSelector(
    (state: ReduxState) => state.mode.isFetchedListsData
  );

  // component state
  const [list, setList] = useState<List | null>(null);
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const list_id: string | undefined = useParams<{ id: string }>().id;

  // component mode
  const [isCreateWordModalOpen, setIsCreateWordModalOpen] =
    useState<boolean>(false);
  const [isSideBtnsActive, setIsSideBtnsActive] = useState<boolean>(false);
  const [isWordShowActive, setIsWordShowActive] = useState<boolean>(true);
  const [isMeanShowActive, setIsMeanShowActive] = useState<boolean>(true);
  const [isMemoShowActive, setIsMemoShowActive] = useState<boolean>(false);
  const [isEditModeActive, setIsEditModeActive] = useState<boolean>(false);
  const [isIncorrectList, setIsIncorrectList] = useState<boolean>(false);

  // funcs for useEffect
  const checkWordsAndfetchWords = useCallback(async (): Promise<void> => {
    const isListWordsInStore: boolean = words.some(
      (word: Word) => word.list_id === list_id
    );

    if (!isListWordsInStore) {
      const fetchingResult: FetchDataReturn = await fetchWordsData(list_id);
      if (fetchingResult?.message === "success") {
        console.log("fetching words is succeed");
        return;
      } else if (fetchingResult?.message === "processing") {
        console.log("fetching words is processing");
        return;
      } else {
        console.log("fetching words is on error");
        navigate("/");
      }
    } else {
      return;
    }
  }, [words, list_id, navigate, fetchWordsData]);

  const checkListsAndfetchLists = useCallback(async (): Promise<void> => {
    if (!isFetchedListsData) {
      if (!lists || lists.length === 0) {
        const fetchingResult: FetchDataReturn = await fetchListsData();
        if (fetchingResult?.message === "success") {
          console.log("fetching lists is succeed");
          return;
        } else if (fetchingResult?.message === "processing") {
          console.log("fetching lists is processing");
          return;
        } else {
          console.log("fetching lists is on error");
          navigate("/");
        }
      }
    }
  }, [lists, fetchListsData, navigate, isFetchedListsData]);

  // useEffects
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const isIncorrectListParam: string | null =
      queryParams.get("isIncorrectList");
    setIsIncorrectList(isIncorrectListParam === "true");
  }, [location.search]);

  useEffect(() => {
    const asyncHandler = async (): Promise<void> => {
      await checkListsAndfetchLists();
      await checkWordsAndfetchWords();
    };
    asyncHandler();
  }, [checkListsAndfetchLists, checkWordsAndfetchWords]);

  useEffect(() => {
    if (lists && lists.length > 0) {
      const foundList: List | undefined = lists.find(
        (list: List) => list?._id === list_id
      );
      setList(foundList || null);
    }
  }, [lists, list_id]);

  // toggle funcs
  const toggleCreateWordModal = (): void => {
    setIsCreateWordModalOpen(!isCreateWordModalOpen);
  };

  const toggleSideBtns = (): void => {
    setIsSideBtnsActive((prev: boolean): boolean => !prev);
  };

  const toggleWordShow = (): void => {
    setIsWordShowActive((prev: boolean): boolean => {
      const newState: boolean = !prev;
      if (!isMeanShowActive && !newState) {
        setIsMeanShowActive(true);
      }
      return newState;
    });
  };

  const toggleMeanShow = (): void => {
    setIsMeanShowActive((prev: boolean): boolean => {
      const newState: boolean = !prev;
      if (!isWordShowActive && !newState) {
        setIsWordShowActive(true);
      }
      return newState;
    });
  };

  const toggleMemoShow = (): void => {
    setIsMemoShowActive((prev: boolean): boolean => !prev);
  };

  const toggleEditMode = (): void => {
    setIsEditModeActive((prev: boolean): boolean => !prev);
  };

  // click handler
  const handleWordDoubleClick = (wordId: string): void => {
    console.log("double!");
    setSelectedWordIds((prevSelectedWordIds: string[]): string[] => {
      if (prevSelectedWordIds.includes(wordId)) {
        return prevSelectedWordIds.filter((id) => id !== wordId);
      } else {
        return [...prevSelectedWordIds, wordId];
      }
    });
  };

  // handlers
  const shuffleWords = (): void => {
    const copiedArray: Word[] = [...words];
    for (let i = copiedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]];
    }
    dispatch({ type: "SET_DATA_WORDS", value: copiedArray });
  };

  const deleteWords = (): void => {
    if (!selectedWordIds || selectedWordIds.length === 0) {
      console.log("There are no selected words.");
      return;
    }

    const updatedWords: Word[] = words.map((word: Word) => {
      if (selectedWordIds.includes(word._id)) {
        return { ...word, is_deleted: true };
      }
      return word;
    });

    dispatch({
      type: "SET_DATA_WORDS",
      value: updatedWords,
    });

    setSelectedWordIds([]);

    selectedWordIds.forEach((id: string): void => {
      const wordToDelete: Word | undefined = words.find(
        (word: Word) => word._id === id
      );
      if (wordToDelete) {
        const updatedWord = { ...wordToDelete, is_deleted: true };
        editedWordsQueue.enqueue(updatedWord);
      } else {
        console.log(`Word with id ${id} not found`);
      }
    });
  };

  const handleCreateIncorrectList = async (): Promise<void> => {
    console.log("let's create incorrect list and send api");

    if (list_id) {
      const data: { list_id: string } = {
        list_id,
      };

      try {
        dispatch({ type: "SET_LOADING", value: true });

        const response: AxiosResponse = await auth.api.post(
          `${staticData.endpoint}/incorrectlist?request=putIncorrectList`,
          data
        );

        if (response?.status === 200 || response?.status === 201) {
          showAlert("Incorrect list created successfully!");
          const newIncorrectList: IncorrectList =
            response.data.answer.incorrectList;
          console.log(newIncorrectList);
          const newIncorrectList_id: string = newIncorrectList._id;
          console.log(newIncorrectList_id);
          if (newIncorrectList_id) {
            const updatedList = {
              ...list,
              linked_incorrect_word_lists: [newIncorrectList_id],
            } as List;
            const updatedLists: List[] = staticData.updateListInArray(
              lists,
              updatedList
            );
            dispatch({
              type: "SET_DATA_LISTS",
              value: updatedLists,
            });
          }
        } else {
          showAlert("Failed to create incorrect list.");
        }
      } catch (error) {
        console.error("create incorrect list API error:", error);
        showAlert("Something went wrong...");
      } finally {
        dispatch({ type: "SET_LOADING", value: false });
      }
    } else {
      showAlert("List ID is required.");
    }
  };

  const handleJoinIncorrectList = (): void => {
    navigate(`/lists/${list_id}?isIncorrectList=true`);
  };

  const handleJoinList = (): void => {
    navigate(`/lists/${list_id}`);
  };

  const handleTakeDirectTest = (
    list_id: string,
    isIncorrectList: boolean
  ): void => {
    navigate(
      `/tests?mode=preparation&list_id=${list_id}&is_direct_list_incorrect=${isIncorrectList}`
    );
  };
  return (
    <div className="container_words">
      <CreateWordModal
        isOpen={isCreateWordModalOpen}
        closeModal={toggleCreateWordModal}
        list_id={list_id}
        language={list?.language}
      />

      <div className="list-header">
        <div className="title-box">
          <SlNotebook className="icon" />
          <h2
            className={`list-title ${
              isIncorrectList ? "incorrect-list-title" : ""
            }`}
          >
            {list?.name}
          </h2>
          {isIncorrectList && <p className="incorrect-list-flag">오답 노트</p>}
        </div>
        <div>
          {!isIncorrectList && (
            <div className="words-btns">
              <button
                className="word-btn test-btn"
                onClick={() => handleTakeDirectTest(list._id, false)}
              >
                <SiTestcafe className="icon" />
              </button>
              {list?.linked_incorrect_word_lists.length === 0 ? (
                <button
                  className="word-btn  create-incorrect-list-button"
                  onClick={handleCreateIncorrectList}
                >
                  <MdNoteAdd className="icon" />
                </button>
              ) : (
                <button
                  className="word-btn  join-incorrect-list-button"
                  onClick={handleJoinIncorrectList}
                >
                  <FaNoteSticky className="icon" />
                </button>
              )}
            </div>
          )}
          {isIncorrectList && (
            <div className="words-btns">
              <button
                className="word-btn test-btn"
                onClick={() => handleTakeDirectTest(list._id, true)}
              >
                <SiTestcafe className="icon" />
              </button>
              <button
                className="word-btn  back-to-list-button"
                onClick={handleJoinList}
              >
                <RiArrowGoBackFill className="icon" />
              </button>
            </div>
          )}
        </div>
      </div>

      {!isIncorrectList && (
        <div className="word-lists">
          {isFetching ? (
            <p>Loading...</p>
          ) : words.length > 0 ? (
            words
              .filter(
                (word: Word) =>
                  word.is_deleted === false && word.list_id === list_id
              )
              .map((word: Word) => (
                <div
                  key={word._id}
                  className="word-box-select"
                  style={{
                    margin: "1px",
                    borderRadius: "5px",
                    transform: selectedWordIds.includes(word._id)
                      ? "scale(1.05)"
                      : "none",
                    transition: "transform 0.2s ease",
                  }}
                  onDoubleClick={() => handleWordDoubleClick(word._id)}
                >
                  <WordBox
                    {...word}
                    isWordShowActive={isWordShowActive}
                    isMeanShowActive={isMeanShowActive}
                    isMemoShowActive={isMemoShowActive}
                    isSelected={selectedWordIds.includes(word?._id)}
                    isEditModeActive={isEditModeActive}
                    incorrectList_id={list?.linked_incorrect_word_lists?.[0]}
                    list_id={list?._id}
                    language={list?.language}
                  />
                </div>
              ))
          ) : (
            <p>empty words</p>
          )}
        </div>
      )}
      {isIncorrectList && (
        <div className="word-lists">
          {isFetching ? (
            <p>Loading...</p>
          ) : words.length > 0 ? (
            words
              .filter(
                (word: Word) =>
                  word.is_deleted === false &&
                  word.list_id === list_id &&
                  word.incorrect_lists.length > 0
              )
              .map((word: Word) => (
                <div
                  key={word?._id}
                  className="word-box-select"
                  style={{
                    margin: "1px",
                    borderRadius: "5px",
                    transform: selectedWordIds.includes(word?._id)
                      ? "scale(1.05)"
                      : "none",
                    transition: "transform 0.2s ease",
                  }}
                  onDoubleClick={() => handleWordDoubleClick(word?._id)}
                >
                  <WordBox
                    {...word}
                    isWordShowActive={isWordShowActive}
                    isMeanShowActive={isMeanShowActive}
                    isMemoShowActive={isMemoShowActive}
                    isSelected={selectedWordIds.includes(word?._id)}
                    isEditModeActive={isEditModeActive}
                    incorrectList_id={list.linked_incorrect_word_lists[0]}
                    list_id={list!._id}
                    isIncorrectList={isIncorrectList}
                    language={list.language}
                  />
                </div>
              ))
          ) : (
            <p>empty incorrect words</p>
          )}
        </div>
      )}
      <div className="btns">
        <div className={`side-btns ${isSideBtnsActive ? "active" : ""}`}>
          <div
            className={`side-btn ${isWordShowActive ? "active" : ""}`}
            onClick={toggleWordShow}
          >
            {isWordShowActive ? (
              <FaRegEye className="icon" />
            ) : (
              <FaRegEyeSlash className="icon" />
            )}
            <p>word</p>
          </div>

          <div
            className={`side-btn ${isMeanShowActive ? "active" : ""}`}
            onClick={toggleMeanShow}
          >
            {isMeanShowActive ? (
              <FaRegEye className="icon" />
            ) : (
              <FaRegEyeSlash className="icon" />
            )}
            <p>mean</p>
          </div>

          <div
            className={`side-btn ${isMemoShowActive ? "active" : ""}`}
            onClick={toggleMemoShow}
          >
            {isMemoShowActive ? (
              <FaRegEye className="icon" />
            ) : (
              <FaRegEyeSlash className="icon" />
            )}
            <p>memo</p>
          </div>
        </div>
        <div
          className={`btn ${isSideBtnsActive ? "Active" : ""}`}
          onClick={toggleSideBtns}
        >
          {isWordShowActive && isMeanShowActive && isMemoShowActive ? (
            <FaRegEye className="icon" />
          ) : (
            <FaRegEyeSlash className="icon" />
          )}
        </div>
        <div className={`btn`} onClick={shuffleWords}>
          <IoShuffle className="icon" />
        </div>
        {!isIncorrectList && (
          <div
            className="btn"
            onClick={toggleCreateWordModal}
            style={{
              width: "80px",
              height: "80px",
            }}
          >
            <FaPlus
              className="icon"
              style={{
                width: "40px",
                height: "40px",
              }}
            />
          </div>
        )}
        <div
          className={`btn ${isEditModeActive ? "Active" : ""}`}
          onClick={toggleEditMode}
        >
          <FaEdit className="icon" />
        </div>

        <div
          className={`btn ${selectedWordIds.length > 0 ? "Active" : ""}`}
          onClick={deleteWords}
        >
          <IoTrashBin className="icon" />
        </div>
      </div>
    </div>
  );
};

export default Words;
