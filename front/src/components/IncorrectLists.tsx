import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// css
import "./IncorrectLists.scss";

// custom
import { useFuncs } from "../funcs";

// components
import IncorrectListBox from "./small/IncorrectListBox";

// types
import { FetchDataReturn, List, ReduxState } from "../types/index";

const IncorrectLists = () => {
  const navigate = useNavigate();

  // mode state
  const isSign = useSelector((state: ReduxState) => state?.mode.isSign);
  const isFetching = useSelector((state: ReduxState) => state.mode.isFetching);
  const isMobile = useSelector((state: ReduxState) => state.mode.isMobile);

  // public data
  const lists = useSelector((state: ReduxState) => state.data.lists);

  // custom hook funcs
  const { fetchListsData } = useFuncs();

  // effect for fetching list data
  useEffect(() => {
    const asyncHandler = async (): Promise<void> => {
      if (!lists || lists.length === 0) {
        const fetchingResult: FetchDataReturn = await fetchListsData();
        if (fetchingResult?.message === "success") {
          console.log("fetching is succeed");
          return;
        } else if (fetchingResult?.message === "processing") {
          console.log("fetching is processing");
          return;
        } else {
          console.log("fetching is on error");
          navigate("/");
        }
      }
    };
    asyncHandler();
  }, [fetchListsData, lists, navigate]);

  // click handler
  const handleClick = (list_id: string) => {
    navigate(`/lists/${list_id}?isIncorrectList=true`);
  };

  return (
    <div
      className={`container-incorrect-lists ${isMobile ? "mobile" : "desktop"}`}
    >
      {!isFetching && isSign && (
        <div className="incorrect-lists">
          {lists && lists.length > 0 ? (
            lists
              .filter(
                (list: List) =>
                  !list?.is_deleted &&
                  list?.linked_incorrect_word_lists.length > 0
              )
              .map((list: List) => (
                <div
                  className="incorrect-list-box"
                  key={list?._id}
                  onClick={() => handleClick(list?._id)}
                >
                  <IncorrectListBox {...list} />
                </div>
              ))
          ) : (
            <p>No incorrect lists</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IncorrectLists;
