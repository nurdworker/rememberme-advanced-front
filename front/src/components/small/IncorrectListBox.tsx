import React from "react";

// css
import "./IncorrectListBox.scss";

// custom
import { staticData } from "../../staticData";

// type
interface ListBoxProps {
  name: string;
  creation_date: string;
  language: string;
  linked_incorrect_word_lists: string[];
  _id: string;
  user_id: string;
  is_deleted: boolean;
}

const IncorrectListBox: React.FC<ListBoxProps> = ({
  name,
  creation_date,
  language,
  linked_incorrect_word_lists,
  _id,
  user_id,
  is_deleted,
}) => {
  //component state
  const flagImage =
    language === "en"
      ? staticData.flag_imgs.en
      : language === "jp"
      ? staticData.flag_imgs.jp
      : "";

  return (
    <div className="incorrect-list-card">
      <div className="incorrect-list-card-body">
        <div
          className="incorrect-list-card-flag"
          style={{
            backgroundImage: `url(${flagImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        <div className="incorrect-list-card-info">
          <h3 className="incorrect-list-card-title">
            {name} <span>오답 노트</span>
          </h3>
          <p className="incorrect-list-card-date">
            {new Date(creation_date).toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncorrectListBox;
