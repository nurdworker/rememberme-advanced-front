// public modules
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// custom
import { useQueue } from "../../../QueueContext";
import { staticData } from "../../../staticData";
import { useFuncs } from "../../../funcs";

// icons
import { FaPlus, FaWikipediaW } from "react-icons/fa";
import { GrSubtractCircle } from "react-icons/gr";
import { SiNaver } from "react-icons/si";
import { RiSpeakAiFill } from "react-icons/ri";

// css
import "./TestWordBox.scss";

// types
import { Word, ReduxState } from "../../../types/index";
interface WordProps extends Word {
  isWordShowActive: boolean;
  isMeanShowActive: boolean;
  isMemoShowActive: boolean;
  isSelected?: boolean;
  isEditModeActive?: boolean;
  incorrectList_id?: string;
  language: string;
  updateEditedWordFromProps: (word: Word) => void;
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
  language,
  updateEditedWordFromProps,
}) => {
  // default
  const dispatch = useDispatch();

  // public data
  const words: Word[] = useSelector(
    (state: ReduxState) => state.data.words || []
  );
  const { editedWordsQueue } = useQueue();
  const { checkWordDataLength } = useFuncs();

  // component state
  const [fontSize, setFontSize] = useState<number>(30);
  const [newMemo, setNewMemo] = useState<string>(memo);

  // component mode
  const [isEditingMemo, setIsEditingMemo] = useState<boolean>(false);

  // js identifier
  const wordData: Word = {
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
  };

  // edit handlers
  const handleSaveMemo = (): void => {
    if (!checkWordDataLength(newMemo, "memo")) {
      return;
    }
    if (wordData.memo !== newMemo) {
      const updatedMemoWord = { ...wordData, memo: newMemo } as Word;
      const updatedWordsArray = staticData.updatedWordsArray(
        words,
        updatedMemoWord
      );
      dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
      updateEditedWordFromProps(updatedMemoWord);
      editedWordsQueue.enqueue(updatedMemoWord);
      setIsEditingMemo(false);
      setNewMemo("");
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
    const updatedWordsArray = staticData.updatedWordsArray(words, updatedWord);
    dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
    updateEditedWordFromProps(updatedWord);
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
    const updatedWordsArray = staticData.updatedWordsArray(words, updatedWord);
    dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
    updateEditedWordFromProps(updatedWord);
    editedWordsQueue.enqueue(updatedWord);
  };

  // handlers dictionary
  const handleNaverDictionary = (word: string): void => {
    const encodedWord = encodeURIComponent(word);
    let url: string | undefined;

    if (language === "en") {
      url = `https://en.dict.naver.com/#/search?query=${encodedWord}`;
    } else if (language === "jp") {
      url = `https://ja.dict.naver.com/#/search?query=${encodedWord}&range=all`;
    } else if (language === "indo") {
      url = `https://dict.naver.com/idkodict/#/search?query=${encodedWord}`;
    }

    if (url) {
      window.open(url, "_blank");
    } else {
      console.error("not supported language");
    }
  };

  const handleWikiDictionary = (word: string): void => {
    const encodedWord = encodeURIComponent(word);
    let url: string | undefined;

    url = `https://en.wikipedia.org/wiki/${encodedWord}`;

    if (url) {
      window.open(url, "_blank");
    } else {
      console.error("not supported language");
    }
  };

  // handler audio
  const handlePlayAudio = (word: string, language: string = "en"): void => {
    const utterance = new SpeechSynthesisUtterance(word);
    if (language === "en") {
      utterance.lang = "en-US";
    } else if (language === "jp") {
      utterance.lang = "ja-JP";
    } else if (language === "indo") {
      utterance.lang = "id-ID";
    } else {
      utterance.lang = "en-US";
    }
    window.speechSynthesis.speak(utterance);
  };

  // useEffects
  useEffect(() => {
    if (word.length > 8) {
      setFontSize(30);
    } else {
      setFontSize(40);
    }
  }, [word]);

  useEffect(() => {
    if (!isEditModeActive) {
      setIsEditingMemo(false);
    }
  }, [isEditModeActive]);

  useEffect(() => {
    setNewMemo("");
  }, [wordData._id]);

  // handler for convenience
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      handleSaveMemo();
    }
  };

  return (
    <div className={`word-box ${isSelected ? "selected" : ""}`}>
      <div className="main-content">
        <div className="main-box">
          {isWordShowActive && (
            <h1 className="word" style={{ fontSize: `${fontSize}px` }}>
              {word}
            </h1>
          )}
          {isMeanShowActive && (
            <h1 className="meaning" style={{ fontSize: `${fontSize}px` }}>
              {mean}
            </h1>
          )}
        </div>
        <div className="side-box">
          {isMemoShowActive &&
            ((isEditModeActive && !memo) || isEditingMemo ? (
              <input
                type="text"
                value={newMemo || memo}
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
        {incorrectList_id && !is_incorrect && (
          <button
            className="side-btn add-incorrect"
            onClick={handleAddWordInIncorrectList}
          >
            {" "}
            <FaPlus className="icon" />
          </button>
        )}

        {incorrectList_id && is_incorrect && (
          <button
            className="side-btn substract-incorrect"
            onClick={handleSubtractWordInFromcorrectList}
          >
            {incorrect_lists.map((listId) => (
              <GrSubtractCircle key={listId} className="icon" />
            ))}
          </button>
        )}
        <button
          className="side-btn play-voice-btn"
          onClick={() => {
            handlePlayAudio(word, language);
          }}
        >
          <RiSpeakAiFill className="icon" />
        </button>
        <button
          className="side-btn naver-dic-btn"
          onClick={() => {
            handleNaverDictionary(word);
          }}
        >
          <SiNaver />
        </button>
        <button
          className="side-btn wiki-dic-btn"
          onClick={() => {
            handleWikiDictionary(word);
          }}
        >
          <FaWikipediaW />
        </button>
      </div>
    </div>
  );
};

export default WordBox;
