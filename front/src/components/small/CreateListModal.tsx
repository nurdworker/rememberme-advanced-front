// public modules
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// css
import "./CreateListModal.scss";

// custom
import { useFuncs } from "../../funcs";
import { auth } from "../../auth";
import { staticData } from "../../staticData";

// type
interface CreateListModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  closeModal,
}) => {
  //default
  const dispatch = useDispatch();

  //public data
  const lists = useSelector((state: any) => state?.data.lists);

  //custom hook funcs
  const { showAlert } = useFuncs();

  //component state
  const [language, setLanguage] = useState<string>("en");
  const [listName, setListName] = useState<string>("");

  // useEffects
  useEffect(() => {
    if (isOpen) {
      setListName("");
    }
  }, [isOpen]);

  // create handler
  const handleAddList = async () => {
    if (listName.trim() && language.trim()) {
      const data = {
        name: listName,
        language: language,
      };
      console.log(data);

      try {
        dispatch({
          type: "SET_LOADING",
          value: true,
        });
        const response = await auth.api.post(
          `${staticData.endpoint}/list?request=putList`,
          {
            ...data,
          }
        );

        if (response?.status === 200 || response?.status === 201) {
          const newList = response.data.answer.list;
          const updatedLists = [...lists, newList];

          dispatch({
            type: "SET_DATA_LISTS",
            value: updatedLists,
          });

          showAlert(`${listName} list is added!`);
          closeModal();
        }
      } catch (error) {
        console.error("create list API error:", error);
        showAlert("Something wrong..");
      } finally {
        dispatch({
          type: "SET_LOADING",
          value: false,
        });
      }
    } else {
      showAlert("Write new list's name!");
    }
  };

  // etc
  if (!isOpen) return null;

  return (
    <div className="create-list-modal-overlay" onClick={closeModal}>
      <div
        className="create-list-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="create-list-modal-header">
          <h3>Let's add a new list!</h3>
          <button className="close-btn" onClick={closeModal}>
            X
          </button>
        </div>
        <div className="create-list-modal-body">
          <label htmlFor="list-name">New List Name</label>
          <input
            id="list-name"
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Type the new list's name"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddList();
              }
            }}
          />

          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="jp">Japanese</option>
          </select>
        </div>
        <div className="create-list-modal-footer">
          <button onClick={handleAddList} className="add-btn">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateListModal;
