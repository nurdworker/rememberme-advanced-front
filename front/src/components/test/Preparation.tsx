import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import "./Preparation.scss";

import { staticData } from "../../staticData";
// custom
import { useFuncs } from "../../funcs";
// types
import { Word, List, ReduxState, FetchDataReturn } from "../../types/index";

import { SlNotebook } from "react-icons/sl";
import { IoMdRefresh } from "react-icons/io";

const Preparation: React.FC = () => {
  const location = useLocation();
  console.log("hello preparation");
  const searchParams = new URLSearchParams(location.search);
  const directListId: string | null = searchParams.get("list_id");
  const isDirectListIncorrect: string | null = searchParams.get(
    "is_direct_list_incorrect"
  );
  const navigate = useNavigate();
  const { fetchWordsData } = useFuncs();

  const lists: List[] = useSelector((state: ReduxState) => state.data.lists);
  const words: Word[] = useSelector((state: ReduxState) => state.data.words);

  const [checkedLists, setCheckedLists] = useState<
    { list_id: string; isIncorrect: boolean }[]
  >([]);

  console.log(directListId);
  console.log(isDirectListIncorrect);

  const handleButtonClick = (listId: string, isIncorrect: boolean) => {
    setCheckedLists((prevCheckedLists) => {
      const existingListIndex = prevCheckedLists.findIndex(
        (item) => item.list_id === listId
      );

      if (existingListIndex !== -1) {
        const existingList = prevCheckedLists[existingListIndex];

        if (existingList.isIncorrect === isIncorrect) {
          return prevCheckedLists.filter((item) => item.list_id !== listId);
        }

        const updatedList = {
          ...existingList,
          isIncorrect: !existingList.isIncorrect,
        };

        return prevCheckedLists.map((item, index) =>
          index === existingListIndex ? updatedList : item
        );
      }

      return [...prevCheckedLists, { list_id: listId, isIncorrect }];
    });
  };

  const flagImageUrl = (language: string): string => {
    if (language === "en") {
      return staticData.flag_imgs.en;
    } else if (language === "jp") {
      return staticData.flag_imgs.jp;
    } else if (language === "indo") {
      return staticData.flag_imgs.indo;
    } else {
      return staticData.flag_imgs.en;
    }
  };

  const wordsCount = (list_id: string): number => {
    return words.filter((word) => word.list_id === list_id).length;
  };

  const checkWordsAndfetchWords = useCallback(
    async (list_id: string): Promise<void> => {
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
    },
    [words, navigate, fetchWordsData]
  );

  const refreshWordsCount = async (list_id): Promise<void> => {
    await checkWordsAndfetchWords(list_id);
  };

  return (
    <div className="container-preparation">
      <p>{JSON.stringify(checkedLists)}</p>
      {/* <p>{JSON.stringify(lists)}</p> */}
      {/* <p>{JSON.stringify(words)}</p> */}
      <div className="lists">
        {lists
          .filter((list: List) => !list.is_deleted)
          .map((list: List, index: number) => (
            <div className="list-row">
              {/* --- */}
              <div
                className={`list-card-body ${
                  checkedLists.some((item) => item.list_id === list._id)
                    ? "selected"
                    : ""
                }`}
              >
                <div
                  className="list-card-flag"
                  style={{
                    backgroundImage: `url(${flagImageUrl(list.language)})`,
                  }}
                ></div>
                <div className={`list-card-info `}>
                  <h3 className="list-card-title">
                    {list.name}
                    <span className="words-count">
                      ({wordsCount(list._id)})
                    </span>
                  </h3>

                  <div className="list-card-side">
                    {wordsCount(list._id) === 0 && (
                      <div
                        className="list-btn refresh-words"
                        onClick={() => refreshWordsCount(list._id)}
                      >
                        <IoMdRefresh className="icon" />
                      </div>
                    )}
                    <div
                      className={`list-btn normal-note ${
                        checkedLists.some(
                          (item) =>
                            item.list_id === list._id &&
                            item.isIncorrect === false
                        )
                          ? "pulse-effect"
                          : ""
                      }`}
                      onClick={() => handleButtonClick(list._id, false)}
                    >
                      <SlNotebook className="icon" />
                    </div>
                    {list.linked_incorrect_word_lists.length > 0 && (
                      <div
                        className={`list-btn incorrect-note ${
                          checkedLists.some(
                            (item) =>
                              item.list_id === list._id &&
                              item.isIncorrect === true
                          )
                            ? "pulse-effect"
                            : ""
                        }`}
                        onClick={() => handleButtonClick(list._id, true)}
                      >
                        <SlNotebook className="icon" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* --- */}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Preparation;
