import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

// css
import "./ListBox.scss";

// custom
import { useQueue } from "../../QueueContext";
import { staticData } from "../../staticData";

// icons
import { FaStar, FaRegStar } from "react-icons/fa";

// types
import { List, ReduxState } from "../../types/index";
interface ListBoxProps extends List {
  isSelected?: boolean;
}

const ListBox: React.FC<ListBoxProps> = ({
  name,
  creation_date,
  language,
  linked_incorrect_word_lists,
  is_bookmark: initialBookmark,
  _id,
  user_id,
  is_deleted,
  isSelected,
}) => {
  //default
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  //mode state
  const isMobile: boolean = useSelector(
    (state: ReduxState) => state.mode.isMobile
  );

  //public data
  const { editedListsQueue } = useQueue();
  const lists: List[] = useSelector((state: ReduxState) => state.data.lists);

  //component state
  const [isBookmark, setIsBookmark] = useState<boolean>(initialBookmark);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>(name);
  const flagImage: string =
    language === "en"
      ? staticData.flag_imgs.en
      : language === "jp"
      ? staticData.flag_imgs.jp
      : language === "indo"
      ? staticData.flag_imgs.indo
      : "";
  const list: ListBoxProps = {
    name,
    creation_date,
    language,
    linked_incorrect_word_lists,
    is_bookmark: isBookmark,
    _id,
    user_id,
    is_deleted,
  };

  // funcs
  const toggleBookmark = (e: React.MouseEvent): void => {
    e.stopPropagation();

    list.is_bookmark = !isBookmark;
    const newLists: List[] = staticData.updateListInArray(lists, list);
    dispatch({
      type: "SET_DATA_LISTS",
      value: newLists,
    });
    editedListsQueue.enqueue(list);
    setIsBookmark(!isBookmark);
  };

  const clickTitle = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const clickInput = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewTitle(e.target.value);
  };

  const handleTitleSave = (): void => {
    if (newTitle !== name) {
      list.name = newTitle;
      const newLists: List[] = staticData.updateListInArray(lists, list);
      dispatch({
        type: "SET_DATA_LISTS",
        value: newLists,
      });
      editedListsQueue.enqueue(list);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      handleTitleSave();
    }
  };

  const joinToList = (_id: string): void => {
    if (location.pathname !== "/wordlists") {
      navigate(`/lists/${_id}`);
    }
  };

  return (
    <div
      className={`word-card ${isMobile ? "mobile" : "desktop"} ${
        isSelected ? "selected" : ""
      }`}
      onClick={() => {
        joinToList(_id);
      }}
    >
      <div className="word-card-body">
        <div
          className="word-card-flag"
          style={{ backgroundImage: `url(${flagImage})` }}
        ></div>
        <div className="word-card-info">
          {isEditing ? (
            <input
              type="text"
              value={newTitle}
              onClick={clickInput}
              onChange={handleTitleChange}
              onBlur={handleTitleSave}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          ) : (
            <h3 className="word-card-title" onClick={clickTitle}>
              {newTitle}
            </h3>
          )}
          <p className="word-card-date">
            {new Date(creation_date).toLocaleDateString("en-GB")}
          </p>
          <div className="word-card-footer">
            {/* <div className="word-card-icons">
              {linked_incorrect_word_lists.map((_, index) => (
                <FaRegStickyNote key={index} className="icon-sticky-note" />
              ))}
            </div> */}
            <span
              className={`icon-bookmark ${isBookmark ? "filled" : ""}`}
              onClick={toggleBookmark}
            >
              {isBookmark ? <FaStar /> : <FaRegStar />}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListBox;
