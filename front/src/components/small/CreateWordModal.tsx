// public modules
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// css
import "./CreateWordModal.scss";

// custom
import { auth } from "../../auth";
import { staticData } from "../../staticData";
import { useFuncs } from "../../funcs";

// type
interface CreateWordModalProps {
  isOpen: boolean;
  closeModal: () => void;
  list_id: string | undefined;
}

const CreateWordModal: React.FC<CreateWordModalProps> = ({
  isOpen,
  closeModal,
  list_id,
}) => {
  // default
  const dispatch = useDispatch();

  // custom hook funcs
  const { showAlert } = useFuncs();

  // public data
  const words = useSelector((state: any) => state?.data.words);

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

  // Handlers
  const handleAddWord = async () => {
    console.log("go create modal api");
    if (word.trim() && meaning.trim()) {
      const data = {
        word: word,
        meaning: meaning,
        list_id, // list_id 사용
      };
      try {
        dispatch({ type: "SET_LOADING", value: true });

        const response = await auth.api.post(
          `${staticData.endpoint}/word?request=putWord`,
          data
        );

        if (response?.status === 200 || response?.status === 201) {
          const newWord = response.data.answer.word;
          const updatedWords = [...words, newWord];

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
