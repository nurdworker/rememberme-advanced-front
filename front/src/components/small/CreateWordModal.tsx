// public modules
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// css
import "./CreateWordModal.scss";

// custom
import { auth } from "../../auth";
import { staticData } from "../../staticData";
import { useFuncs } from "../../funcs";

// types
import { Word, ReduxState } from "../../types";
import { AxiosResponse } from "axios";

// icon
import { SiNaver } from "react-icons/si";
interface CreateWordModalProps {
  isOpen: boolean;
  closeModal: () => void;
  list_id: string | undefined;
  language: string;
}

const CreateWordModal: React.FC<CreateWordModalProps> = ({
  isOpen,
  closeModal,
  list_id,
  language,
}) => {
  // default
  const dispatch = useDispatch();

  // custom hook funcs
  const { showAlert, checkWordDataLength } = useFuncs();

  // public data
  const words: Word[] = useSelector((state: ReduxState) => state?.data.words);

  // component state
  const [word, setWord] = useState<string>("");
  const [meaning, setMeaning] = useState<string>("");

  // useEffects
  useEffect(() => {
    if (isOpen) {
      setWord("");
      setMeaning("");
    }
  }, [isOpen]);

  // some funcs..
  const isDuplicatedWord = (list_id: string, word: string): boolean => {
    return words.some((item) => item.list_id === list_id && item.word === word);
  };

  // Handlers
  const handleAddWord = async () => {
    if (word.trim() && meaning.trim()) {
      const data = {
        word: word,
        meaning: meaning,
        list_id,
      };
      if (
        !checkWordDataLength(word, "word") ||
        !checkWordDataLength(meaning, "mean")
      ) {
        return;
      }

      if (isDuplicatedWord(list_id, word)) {
        showAlert("there is duplicated word..");
        return;
      }
      try {
        dispatch({ type: "SET_LOADING", value: true });

        const response: AxiosResponse = await auth.api.post(
          `${staticData.endpoint}/word?request=putWord`,
          data
        );

        if (response?.status === 200 || response?.status === 201) {
          const newWord: Word = response.data.answer.word;
          const updatedWords: Word[] = [...words, newWord];

          dispatch({
            type: "SET_DATA_WORDS",
            value: updatedWords,
          });

          showAlert(`"${word}" added successfully!`);
          closeModal();
        } else {
          showAlert("Failed to add word.");
        }
      } catch (error) {
        console.error("create word API error:", error);
        showAlert("Something went wrong...");
      } finally {
        dispatch({ type: "SET_LOADING", value: false });
      }
    } else {
      showAlert("Please fill in both word and meaning.");
    }
  };

  const handleDic = (word) => {
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
    console.log(word);
  };
  // etc
  if (!isOpen) return null;

  return (
    <div className="create-word-modal-overlay" onClick={closeModal}>
      <div
        className="create-word-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="create-word-modal-header">
          <h3>Let's add a new word!</h3>
          <button className="close-btn" onClick={closeModal}>
            X
          </button>
        </div>
        <div className="create-word-modal-body">
          <label htmlFor="word">Word</label>
          <input
            id="word"
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter word"
          />
          {word && (
            <button
              className="naver-dic-btn"
              onClick={() => {
                handleDic(word);
              }}
            >
              <SiNaver />
            </button>
          )}

          <label htmlFor="meaning">Meaning</label>
          <input
            id="meaning"
            type="text"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="Enter meaning"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddWord();
              }
            }}
          />
        </div>
        <div className="create-word-modal-footer">
          <button onClick={handleAddWord} className="add-btn">
            Add Word
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWordModal;
