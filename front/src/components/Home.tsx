// public modules
import { useEffect } from "react";
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
  const { showAlert } = useFuncs();
  const dispatch = useDispatch();

  //mode state
  const isSign = useSelector((state: ReduxState) => state?.mode.isSign);
  const isFetching = useSelector((state: ReduxState) => state?.mode.isFetching);
  const isMobile = useSelector((state: ReduxState) => state.mode.isMobile);

  // public data
  const lists = useSelector((state: ReduxState) => state?.data.lists);

  // useEffects
  useEffect(() => {
    if (!editedListsQueue.isEmpty()) {
      queueChangedRef.current = true;
    }
  }, [editedListsQueue]);

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

  return (
    <div className={`container_home ${isMobile ? "mobile" : "desktop"}`}>
      {!isSign && (
        <div className="hi-box">
          <GoogleLoginButton onClick={handleSign} />

          <div className="flex flex-col items-center text-center p-6 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              🎉 Nurd Worker의{" "}
              <span className="text-blue-500">Remember Me</span> 프로젝트에 오신
              것을 환영합니다! 🎉
            </h1>

            <ul className="space-y-2 text-gray-700 text-lg">
              <li>
                ✅ 체험을 원하시는 분은{" "}
                <span className="font-semibold text-blue-600">
                  상단의 구글 로그인 버튼
                </span>
                을 클릭해서 체험하세요~
              </li>
              <li>
                🎥 <span className="font-semibold">영상에서 사용 방법</span>이
                나와있습니다.
              </li>
              <li>
                ⚠️ 어느날 갑자기 사용이 안될 수도 있어요 ㅠ <br /> 돈 없는{" "}
                <span className="text-red-500 font-bold">취준생</span>을
                이해해주세요. 🙏
              </li>
            </ul>

            {/* 유튜브 영상 추가 */}
            <div className="w-full max-w-2xl pt-8">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  className="w-full h-full rounded-lg shadow-lg"
                  src="https://www.youtube.com/embed/MEIIWAcPjt0"
                  title="YouTube video"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isFetching && isSign && (
        <div className="contents-home">
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

          <div className="title-box">
            <img
              className="lang-img bounce-top"
              src={staticData.flag_imgs.indo}
              alt="INDO Flag"
            />
            <h6 className="title-lang">Indonesian</h6>
          </div>

          <div className="lists">
            {lists && lists.length > 0 ? (
              lists
                .filter(
                  (list: List) => list.language === "indo" && !list.is_deleted
                )
                .map((list: List) => <ListBox key={list._id} {...list} />)
            ) : (
              <p>No Indonesian word lists</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
