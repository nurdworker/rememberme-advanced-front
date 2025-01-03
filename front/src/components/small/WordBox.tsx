import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// custom
import { useQueue } from "../../QueueContext";
import { staticData } from "../../staticData";

// icons
import { FaPlus } from "react-icons/fa";
import { GrSubtractCircle } from "react-icons/gr";

// css
import "./WordBox.scss";

// types
import { Word, ReduxState } from "../../types/index";
interface WordProps extends Word {
  isWordShowActive: boolean;
  isMeanShowActive: boolean;
  isMemoShowActive: boolean;
  isSelected?: boolean;
  isEditModeActive?: boolean;
  incorrectList_id?: string;
  isIncorrectList?: boolean;
}

const WordBox: React.FC<WordProps> = ({
  _id,
  word,
  mean,
  memo,
  is_incorrect,
  list_id,
  user_id,
  creation_date,
  is_deleted,
  incorrect_lists,
  isWordShowActive,
  isMeanShowActive,
  isMemoShowActive,
  isSelected,
  isEditModeActive,
  incorrectList_id,
  isIncorrectList,
}) => {
  // default
  const dispatch = useDispatch();

  // mode state
  // const isMobile = useSelector((state: any) => state.mode.isMobile);

  // public data
  const { editedWordsQueue } = useQueue();
  const words: Word[] = useSelector((state: ReduxState) => state.data.words);

  // component state
  const [fontSize, setFontSize] = useState<number>(40);
  const [isEditingWord, setIsEditingWord] = useState<boolean>(false);
  const [isEditingMean, setIsEditingMean] = useState<boolean>(false);
  const [isEditingMemo, setIsEditingMemo] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>(word);
  const [newMean, setNewMean] = useState<string>(mean);
  const [newMemo, setNewMemo] = useState<string>(memo);

  // js identifier
  const wordData: Word = words.find((word: Word) => word._id === _id) as Word;

  // edit handlers
  const handleSaveWord = () => {
    if (wordData?.word !== newWord) {
      const updatedWord = { ...wordData, word: newWord } as Word;
      const updatedWordsArray: Word[] = staticData.updatedWordsArray(
        words,
        updatedWord
      );
      dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
      editedWordsQueue.enqueue(updatedWord);
      setIsEditingWord(false);
    } else {
      console.log("not changed word data");
      setIsEditingWord(false);
    }
  };

  const handleSaveMean = (): void => {
    if (wordData?.mean !== newMean) {
      const updatedMeanWord = { ...wordData, mean: newMean } as Word;
      const updatedWordsArray: Word[] = staticData.updatedWordsArray(
        words,
        updatedMeanWord
      );
      dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
      editedWordsQueue.enqueue(updatedMeanWord);
      setIsEditingMean(false);
    } else {
      console.log("not changed mean data");
      setIsEditingMean(false);
    }
  };

  const handleSaveMemo = (): void => {
    if (wordData.memo !== newMemo) {
      const updatedMemoWord = { ...wordData, memo: newMemo } as Word;
      const updatedWordsArray: Word[] = staticData.updatedWordsArray(
        words,
        updatedMemoWord
      );
      dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
      editedWordsQueue.enqueue(updatedMemoWord);
      setIsEditingMemo(false);
    } else {
      console.log("not changed memo data");
      setIsEditingMemo(false);
    }
  };

  const handleAddWordInIncorrectList = (): void => {
    const updatedWord: Word = {
      ...wordData,
      is_incorrect: true,
      incorrect_lists: wordData.incorrect_lists.includes(incorrectList_id)
        ? wordData.incorrect_lists
        : [...wordData.incorrect_lists, incorrectList_id],
    };

    const updatedWordsArray: Word[] = staticData.updatedWordsArray(
      words,
      updatedWord
    );
    dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
    editedWordsQueue.enqueue(updatedWord);
  };

  const handleSubtractWordInFromcorrectList = (): void => {
    const updatedWord: Word = {
      ...wordData,
      is_incorrect: false,
      incorrect_lists: wordData.incorrect_lists.filter(
        (listId: string) => listId !== incorrectList_id
      ),
    };

    const updatedWordsArray: Word[] = staticData.updatedWordsArray(
      words,
      updatedWord
    );
    dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
    editedWordsQueue.enqueue(updatedWord);
  };

  // useEffects
  useEffect(() => {
    if (word.length > 8 || newWord.length > 8) {
      setFontSize(20);
    } else {
      setFontSize(30);
    }
  }, [word, newWord]);

  useEffect(() => {
    if (!isEditModeActive) {
      setIsEditingWord(false);
      setIsEditingMean(false);
      setIsEditingMemo(false);
    }
  }, [isEditModeActive]);

  // handler for convenience
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      handleSaveWord();
      handleSaveMean();
      handleSaveMemo();
    }
  };

  return (
    <div className={`word-box ${isSelected ? "selected" : ""}`}>
      <div className="main-content">
        <div className="main-box">
          {isWordShowActive &&
            (isEditingWord ? (
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onBlur={handleSaveWord}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <h1
                className="word"
                style={{ fontSize: `${fontSize}px` }}
                onClick={() => isEditModeActive && setIsEditingWord(true)}
              >
                {word}
              </h1>
            ))}
          {isMeanShowActive &&
            (isEditingMean ? (
              <input
                type="text"
                value={newMean}
                onChange={(e) => setNewMean(e.target.value)}
                onBlur={handleSaveMean}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <h1
                className="meaning"
                onClick={() => isEditModeActive && setIsEditingMean(true)}
              >
                {mean}
              </h1>
            ))}
        </div>
        <div className="side-box">
          {isMemoShowActive &&
            ((isEditModeActive && !memo) || isEditingMemo ? (
              <input
                type="text"
                value={newMemo}
                onChange={(e) => setNewMemo(e.target.value)}
                onBlur={handleSaveMemo}
                onKeyDown={handleKeyDown}
                autoFocus
                className="memo-input"
                placeholder="Add a memo..."
              />
            ) : (
              <p
                className="memo"
                onClick={() => isEditModeActive && setIsEditingMemo(true)}
              >
                {memo || "empty"}
              </p>
            ))}
          <p className="creation-date">
            {new Date(creation_date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="side-content">
        {incorrectList_id && !isIncorrectList && !is_incorrect && (
          <button
            className="add-incorrect incorrect-btn"
            onClick={handleAddWordInIncorrectList}
          >
            {" "}
            <FaPlus className="icon" />
          </button>
        )}

        {incorrectList_id && is_incorrect && (
          <button
            className="substract-incorrect incorrect-btn"
            onClick={handleSubtractWordInFromcorrectList}
          >
            {incorrect_lists.map((listId) => (
              <GrSubtractCircle key={listId} className="icon" />
            ))}
          </button>
        )}
      </div>
    </div>
  );
};

export default WordBox;
