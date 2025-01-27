// public modules
import { useEffect, useCallback } from "react";
import { Provider } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";

// redux store
import { store } from "./store";

// css
import "./App.scss";

// custom
import { useQueue } from "./QueueContext";
import { QueueProvider } from "./QueueContext";
import { useFuncs } from "./funcs";

// icons
import { IoIosLogOut, IoIosListBox } from "react-icons/io";
import { MdOutlineEventNote } from "react-icons/md";
import { FaList } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai";
import { SiTestcafe } from "react-icons/si";

// components
import TestZone from "./components/TestZone";
import Home from "./components/Home";
import Lists from "./components/Lists";
import Words from "./components/Words";
import Tests from "./components/Tests";
import IncorrectLists from "./components/IncorrectLists";
import ErrorBoundary from "./components/ErrorBoundary";
import Auth from "./components/Auth";
import AlertModal from "./components/small/AlertModal";
import Loading from "./components/small/Loading";
import BlockLoading from "./components/small/BlockLoading";

// public types
import { UserInfo, ReduxState } from "./types/index";

const AppContent = () => {
  // default
  const location = useLocation();
  const dispatch = useDispatch();
  const isDev = process.env.REACT_APP_ENV === "dev";
  const { fetchListsData } = useFuncs();

  //mode state
  const isSign = useSelector((state: ReduxState) => state.mode.isSign);
  const isLoading = useSelector((state: ReduxState) => state.mode.isLoading);
  const isBlockLoading = useSelector(
    (state: ReduxState) => state.mode.isBlockLoading
  );
  const isAlert = useSelector((state: ReduxState) => state.mode.isAlert);

  const alertMessage = useSelector((state: ReduxState) => state.alertMessage);

  // const testWords = useSelector((state: ReduxState) => state.data.words);
  // const testLists = useSelector((state: ReduxState) => state.data.lists);

  // public data
  const userInfo: UserInfo = useSelector((state: ReduxState) => state.userInfo);
  const { editedListsQueue, editedWordsQueue } = useQueue();

  //component state

  // funcs
  const handleSignOut = (): void => {
    localStorage.clear();
    window.location.reload();
  };

  const saveListsQueueDataAtDb = useCallback(async () => {
    if (editedListsQueue.isEmpty()) {
      return;
    }
    await editedListsQueue.forceTrigger();
  }, [editedListsQueue]);

  const saveWordsQueueDataAtDb = useCallback(async () => {
    if (editedWordsQueue.isEmpty()) {
      return;
    }
    await editedWordsQueue.forceTrigger();
  }, [editedWordsQueue]);

  const getNavItemClass = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  // basic handlers
  window.addEventListener("beforeunload", (event) => {
    if (
      window.location.href.includes(
        "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount"
      )
    ) {
      return;
    }
    saveListsQueueDataAtDb();
    saveWordsQueueDataAtDb()
      .then(() => {
        event.preventDefault();
      })
      .catch((error) => {
        console.error("Error saving data:", error);
        event.preventDefault();
      });
  });

  useEffect(() => {
    console.log("router is changed!", location.pathname);

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      saveListsQueueDataAtDb();
      saveWordsQueueDataAtDb();
    }
  }, [location, saveListsQueueDataAtDb, saveWordsQueueDataAtDb]);

  // useEffects
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      dispatch({ type: "SET_MOBILE", value: isMobile });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  //---------------------
  const processQueueThenFetch = useCallback(async (): Promise<void> => {
    await saveListsQueueDataAtDb();
    await fetchListsData();
  }, [saveListsQueueDataAtDb, fetchListsData]);

  useEffect(() => {
    processQueueThenFetch();
  }, [processQueueThenFetch]);

  // user Info effect
  useEffect(() => {
    const email = localStorage.getItem("email");
    const picture = localStorage.getItem("picture");

    if (email && picture) {
      const userInfo: UserInfo = { email, picture };
      dispatch({ type: "SET_USER_INFO", value: userInfo });
    }
  }, [dispatch]);

  return (
    <div className="App">
      <div className="container_app">
        {isLoading && <Loading isLoading={isLoading} />}
        {isBlockLoading && <BlockLoading isBlockLoading={isBlockLoading} />}

        {isAlert && <AlertModal message={alertMessage} onClose={() => {}} />}

        <nav className="nav_top">
          <div className=" flex items-center text-white font-bold text-2xl sm:text-3xl lg:text-4xl">
            <MdOutlineEventNote className="mr-2" />
            <p
              className="tracking-in-expand hidden sm:block "
              style={{
                fontFamily: "kanit",
                fontWeight: "bold",
              }}
            >
              Remember me
            </p>
          </div>
          {userInfo && userInfo.email ? (
            <div className="flex items-center space-x-4 ml-auto">
              <img
                className="h-[30px] w-[30px] rounded-full border-2 border-white shadow-md"
                src={userInfo.picture || ""}
                alt="User Profile"
              />
              <div className="text-white font-semibold">
                <p>{userInfo.email}</p>
              </div>
              {!isSign ? null : (
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14">
                  <IoIosLogOut
                    className="text-white text-2xl md:text-3xl"
                    onClick={handleSignOut}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-white text-lg font-semibold ml-auto flex items-center space-x-2">
              <p>&nbsp;&nbsp;&nbsp;</p>
            </div>
          )}
        </nav>

        <nav className="slide-in-bck-center nav_bot flex justify-around items-center w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 p-4 fixed bottom-0 left-0 z-50">
          <div
            className={`nav_item flex items-center space-x-2 ${getNavItemClass(
              "/"
            )}`}
          >
            <Link to="/" className="flex items-center space-x-2 bounce-top">
              <AiOutlineHome className="text-white text-2xl" />
              <span className="text-white hidden sm:block">Home</span>
            </Link>
          </div>

          <div
            className={`nav_item flex items-center space-x-2 ${getNavItemClass(
              "/wordlists"
            )}`}
          >
            <Link
              to="/wordlists"
              className="flex items-center space-x-2 bounce-top"
            >
              <FaList className="text-white text-2xl" />
              <span className="text-white hidden sm:block">Word Lists</span>
            </Link>
          </div>

          <div
            className={`nav_item flex items-center space-x-2 ${getNavItemClass(
              "/incorrectlists"
            )}`}
          >
            <Link
              to="/incorrectlists"
              className="flex items-center space-x-2 bounce-top"
            >
              <IoIosListBox className="text-white text-2xl" />
              <span className="text-white hidden sm:block">
                Incorrect Lists
              </span>
            </Link>
          </div>

          <div
            className={`nav_item flex items-center space-x-2 ${getNavItemClass(
              "/tests"
            )}`}
          >
            <Link
              to="/tests"
              className="flex items-center space-x-2 bounce-top"
            >
              <SiTestcafe className="text-white text-2xl" />
              <span className="text-white hidden sm:block">Word Test</span>
            </Link>
          </div>
        </nav>

        <div className="router_screen">
          {/* <p>{JSON.stringify(testWords)}</p>
          <p>끊어!</p>
          <p>{JSON.stringify(testLists)}</p> */}

          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wordlists" element={<Lists />} />
              <Route path="/incorrectlists" element={<IncorrectLists />} />
              <Route path="/lists/:id" element={<Words />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/tests" element={<Tests />} />
              {/* <Route path="/incorectlists/:id" element={<IncorrectWords />} /> */}
            </Routes>
          </ErrorBoundary>
          {isDev && <TestZone />}
        </div>
      </div>
    </div>
  );
};

// App component
function App() {
  return (
    <Provider store={store}>
      <QueueProvider>
        <Router future={{ v7_startTransition: false }}>
          <AppContent />
        </Router>
      </QueueProvider>
    </Provider>
  );
}

export default App;
