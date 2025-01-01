import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

// css
import "./Words.scss";

// components
import WordBox from "./small/WordBox";
import CreateWordModal from "./small/CreateWordModal";

// custom
import { useFuncs } from "../funcs";
import { useQueue } from "../QueueContext";

// icons
import { FaPlus, FaEdit } from "react-icons/fa";
import { FaRegEye, FaNoteSticky, FaRegEyeSlash } from "react-icons/fa6";
import { IoTrashBin, IoShuffle } from "react-icons/io5";
import { MdNoteAdd } from "react-icons/md";
import { SlNotebook } from "react-icons/sl";
import { RiArrowGoBackFill } from "react-icons/ri";

//custom hook funcs
import { auth } from "../auth";
import { staticData } from "../staticData";

const Words = () => {
  const list_id = useParams<{ id: string }>().id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { editedWordsQueue } = useQueue();

  const { fetchWordsData, fetchListsData, showAlert } = useFuncs();
  const isFetching = useSelector((state: any) => state.mode.isFetching);
  const location = useLocation();

  // 단어장 데이터 가져오기

  const words = useSelector((state: any) => state.data.words || []);
  const lists = useSelector((state: any) => state.data.lists);
  const [list, setList] = useState<any>(null);
  const [isCreateWordModalOpen, setIsCreateWordModalOpen] = useState(false);
  const [isSideBtnsActive, setIsSideBtnsActive] = useState(false);
  const [isWordShowActive, setIsWordShowActive] = useState(true);
  const [isMeanShowActive, setIsMeanShowActive] = useState(true);
  const [isMemoShowActive, setIsMemoShowActive] = useState(false);

  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);

  const [isEditModeActive, setIsEditModeActive] = useState(false);

  const [isIncorrectList, setIsIncorrectList] = useState<boolean>(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const isIncorrectListParam = queryParams.get("isIncorrectList");
    setIsIncorrectList(isIncorrectListParam === "true");
  }, [location.search]);

  const checkListsAndfetchLists = useCallback(async () => {
    if (!lists || lists.length === 0) {
      const fetchingResult = await fetchListsData();
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
  }, [lists, navigate, fetchListsData]);
  const checkWordsAndfetchWords = useCallback(async () => {
    const isListWordsInStore = words.some(
      (word: any) => word.list_id === list_id
    );
    if (!isListWordsInStore) {
      const fetchingResult = await fetchWordsData(list_id);
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
    }
  }, [words, list_id, navigate, fetchWordsData]);

  useEffect(() => {
    const asyncHandler = async () => {
      await checkListsAndfetchLists();
      await checkWordsAndfetchWords();
    };
    asyncHandler();
  }, [checkListsAndfetchLists, checkWordsAndfetchWords]);

  useEffect(() => {
    if (lists && lists.length > 0) {
      console.log(lists.length);
      const foundList = lists.find((list: any) => list?._id === list_id);
      console.log(foundList);
      setList(foundList || null);
    }
  }, [lists, list_id]);

  const toggleCreateWordModal = () => {
    setIsCreateWordModalOpen(!isCreateWordModalOpen);
  };

  const toggleSideBtns = () => {
    setIsSideBtnsActive((prev) => !prev);
  };

  const toggleWordShow = () => {
    setIsWordShowActive((prev) => {
      const newState = !prev;
      if (!isMeanShowActive && !newState) {
        setIsMeanShowActive(true);
      }
      return newState;
    });
  };

  const toggleMeanShow = () => {
    setIsMeanShowActive((prev) => {
      const newState = !prev;
      if (!isWordShowActive && !newState) {
        setIsWordShowActive(true);
      }
      return newState;
    });
  };

  const toggleMemoShow = () => {
    setIsMemoShowActive((prev) => !prev);
  };

  const handleWordDoubleClick = (wordId: string) => {
    console.log("double!");
    setSelectedWordIds((prevSelectedWordIds) => {
      if (prevSelectedWordIds.includes(wordId)) {
        return prevSelectedWordIds.filter((id) => id !== wordId);
      } else {
        return [...prevSelectedWordIds, wordId];
      }
    });
  };

  const toggleEditMode = () => {
    setIsEditModeActive((prev) => !prev);
  };

  const shuffleWords = () => {
    const copiedArray = [...words];
    for (let i = copiedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]];
    }
    dispatch({ type: "SET_DATA_WORDS", value: copiedArray });
  };

  const deleteWords = () => {
    if (!selectedWordIds || selectedWordIds.length === 0) {
      console.log("There are no selected words.");
      return;
    }

    const updatedWords = words.map((word: any) => {
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

    selectedWordIds.forEach((id) => {
      const wordToDelete = words.find((word: any) => word._id === id);
      if (wordToDelete) {
        const updatedWord = { ...wordToDelete, is_deleted: true };
        editedWordsQueue.enqueue(updatedWord);
      } else {
        console.log(`Word with id ${id} not found`);
      }
    });
  };

  const handleCreateIncorrectList = async () => {
    console.log("go create incorrect list api");

    if (list_id) {
      const data = {
        list_id,
      };

      try {
        dispatch({ type: "SET_LOADING", value: true });

        const response = await auth.api.post(
          `${staticData.endpoint}/incorrectlist?request=putIncorrectList`,
          data
        );

        if (response?.status === 200 || response?.status === 201) {
          showAlert("Incorrect list created successfully!");
          const newIncorrectList = response.data.answer.incorrectList;
          console.log(newIncorrectList);
          const newIncorrectList_id = newIncorrectList._id;
          console.log(newIncorrectList_id);
          const updatedList = {
            ...list,
            linked_incorrect_word_lists: [newIncorrectList_id],
          };
          const updatedLists = staticData.updateListInArray(lists, updatedList);
          dispatch({
            type: "SET_DATA_LISTS",
            value: updatedLists,
          });
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

  const handleJoinIncorrectList = () => {
    navigate(`/lists/${list_id}?isIncorrectList=true`);
  };

  const handleJoinList = () => {
    navigate(`/lists/${list_id}`);
  };

  return (
    <div className="container_words">
      <CreateWordModal
        isOpen={isCreateWordModalOpen}
        closeModal={toggleCreateWordModal}
        list_id={list_id}
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
            <div>
              {list?.linked_incorrect_word_lists.length === 0 ? (
                <button
                  className="incorrect-list-btn create-incorrect-list-button"
                  onClick={handleCreateIncorrectList}
                >
                  <MdNoteAdd className="icon" />
                </button>
              ) : (
                <button
                  className="incorrect-list-btn join-incorrect-list-button"
                  onClick={handleJoinIncorrectList}
                >
                  <FaNoteSticky className="icon" />
                </button>
              )}
            </div>
          )}
          {isIncorrectList && (
            <div>
              <button
                className="incorrect-list-btn back-to-list-button"
                onClick={handleJoinList}
              >
                <RiArrowGoBackFill className="icon" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* <h2>{list?.name} 단어장</h2>
      <p
        style={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(lists, null, 2)}
      </p> */}
      {!isIncorrectList && (
        <div className="word-lists">
          {isFetching ? (
            <p>Loading...</p>
          ) : words.length > 0 ? (
            words
              .filter(
                (word: any) =>
                  word.is_deleted === false && word.list_id === list_id
              )
              .map((word: any) => (
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
                    incorrectList_id={list?.linked_incorrect_word_lists[0]}
                    list_id={list?._id}
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
                (word: any) =>
                  word.is_deleted === false &&
                  word.list_id === list_id &&
                  word.incorrect_lists.length > 0
              )
              .map((word: any) => (
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
                    incorrectList_id={list?.linked_incorrect_word_lists[0]}
                    list_id={list?._id}
                    isIncorrectList={isIncorrectList}
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
