// public modules
import React, { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRef } from "react";

// css
import "./Home.scss";

// custom
import { auth } from "../auth";
import { staticData } from "../staticData";
import { useQueue } from "../QueueContext";
import { useFuncs } from "../funcs";

// components
import ListBox from "./small/ListBox";

// icons
import { MdFavorite } from "react-icons/md";
import { List, ReduxState } from "../types";

// type

// simple components
const GoogleLoginButton = ({ onClick }: any) => (
  <button className="google-login-btn" type="button" onClick={onClick}>
    <img
      src={staticData.google_img}
      alt="Google logo"
      className="google-logo"
    />
    <span>Login with Google</span>
  </button>
);

const Home = () => {
  // default
  const { editedListsQueue } = useQueue();
  const queueChangedRef = useRef<boolean>(false);
  const { fetchListsData, showAlert } = useFuncs();
  const dispatch = useDispatch();

  //mode state
  const isSign = useSelector((state: ReduxState) => state?.mode.isSign);
  const isFetching = useSelector((state: ReduxState) => state?.mode.isFetching);
  const isMobile = useSelector((state: ReduxState) => state.mode.isMobile);

  // public data
  const lists = useSelector((state: ReduxState) => state?.data.lists);

  // funcs
  const saveListsQueueDataAtDb = useCallback(async (): Promise<void> => {
    if (editedListsQueue.isEmpty()) {
      console.log("Queue is empty, nothing to save.");
      return;
    }

    if (queueChangedRef.current) {
      await editedListsQueue.forceTrigger();

      queueChangedRef.current = false;
    }
  }, [editedListsQueue]);

  const processQueueThenFetch = useCallback(async (): Promise<void> => {
    await saveListsQueueDataAtDb();
    await fetchListsData();
  }, [saveListsQueueDataAtDb, fetchListsData]);
  // useEffects
  useEffect(() => {
    if (!editedListsQueue.isEmpty()) {
      queueChangedRef.current = true;
    }
  }, [editedListsQueue]);

  useEffect(() => {
    processQueueThenFetch();
  }, [processQueueThenFetch]);

  const handleSign = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", value: true });
      await auth.joinGoogleOauthUrl();
    } catch (error) {
      console.log(error);
      console.error("Error during Google OAuth:", error);
      showAlert("something wrong..");
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  };
  const testAlert = (): void => {
    showAlert("안녕dddddddddddddddd?");
    console.log("gogo");
  };

  return (
    <div className={`container_home ${isMobile ? "mobile" : "desktop"}`}>
      {!isSign && <GoogleLoginButton onClick={handleSign} />}
      {!isFetching && isSign && (
        <div className="contents-home">
          <div onClick={testAlert}>알러트테스트!!</div>

          <div className="title-box">
            <MdFavorite
              className="bounce-top"
              style={{ fontSize: "40px", color: "#FF6347" }}
            />
            <h6 className="title-favorite">My Favorite Notes</h6>
          </div>

          <div className="lists">
            {lists && lists.length > 0 ? (
              lists
                .filter((list: List) => list.is_bookmark && !list.is_deleted)
                .map((list: List) => <ListBox key={list._id} {...list} />)
            ) : (
              <p>No bookmarked word lists</p>
            )}
          </div>

          <div className="title-box p-2">
            <img
              className="lang-img bounce-top"
              src={staticData.flag_imgs.en}
              alt="US Flag"
            />
            <h6 className="title-lang">English</h6>
          </div>

          <div className="lists">
            {lists && lists.length > 0 ? (
              lists
                .filter(
                  (list: List) => list.language === "en" && !list.is_deleted
                )
                .map((list: List) => <ListBox key={list._id} {...list} />)
            ) : (
              <p>No English word lists.</p>
            )}
          </div>

          <div className="title-box">
            <img
              className="lang-img bounce-top"
              src={staticData.flag_imgs.jp}
              alt="JP Flag"
            />
            <h6 className="title-lang">Japanese</h6>
          </div>

          <div className="lists">
            {lists && lists.length > 0 ? (
              lists
                .filter(
                  (list: List) => list.language === "jp" && !list.is_deleted
                )
                .map((list: List) => <ListBox key={list._id} {...list} />)
            ) : (
              <p>No Japanese word lists</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
