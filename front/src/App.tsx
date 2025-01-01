// public modules
import React, { useEffect, useCallback } from "react";
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

// icons
import { IoIosLogOut, IoIosListBox } from "react-icons/io";
import { MdOutlineEventNote } from "react-icons/md";
import { FaList } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai";

// components
// import TestZone from "./components/TestZone";
import Home from "./components/Home";
import Lists from "./components/Lists";
import Words from "./components/Words";
import IncorrectLists from "./components/IncorrectLists";
import ErrorBoundary from "./components/ErrorBoundary";
import Auth from "./components/Auth";
import AlertModal from "./components/small/AlertModal";
import Loading from "./components/small/Loading";

const AppContent = () => {
  // default
  const location = useLocation();
  const dispatch = useDispatch();

  //mode state
  const isSign = useSelector((state: any) => state.mode.isSign);
  const isLoading = useSelector((state: any) => state.mode.isLoading);
  const isAlert = useSelector((state: any) => state.mode.isAlert);
  const alertMessage = useSelector((state: any) => state.alertMessage);

  // public data
  const userInfo = useSelector((state: any) => state.userInfo);
  const { editedListsQueue, editedWordsQueue } = useQueue();

  //component state

  // funcs
  const handleSignOut = () => {
    localStorage.clear();
    dispatch({ type: "SET_USER_INFO", value: null });
    dispatch({ type: "SET_DATA", value: {} });
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

  // router effect
  useEffect(() => {
    const handleRouteChange = async () => {
      if (location.pathname === "/") {
        console.log("Root path, skipping save.");
        return; // 무한렌더링 방지
      }

      if (!editedListsQueue.isEmpty()) {
        await saveListsQueueDataAtDb();
      }
      if (!editedWordsQueue.isEmpty()) {
        await saveWordsQueueDataAtDb();
      }
      console.log(`Current Path: ${location.pathname}`);
    };

    handleRouteChange();
  }, [
    location,
    editedListsQueue,
    editedWordsQueue,
    saveListsQueueDataAtDb,
    saveWordsQueueDataAtDb,
  ]);

  // user Info effect
  useEffect(() => {
    const email = localStorage.getItem("email");
    const picture = localStorage.getItem("picture");

    if (email && picture) {
      const userInfo = { email, picture };
      dispatch({ type: "SET_USER_INFO", value: userInfo });
    }
  }, [dispatch]);

  return (
    <div className="App">
      <div className="container_app">
        {isLoading && <Loading isLoading={isLoading} />}

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
                <IoIosLogOut
                  className="text-white text-3xl font-bold"
                  onClick={handleSignOut}
                />
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
        </nav>

        <div className="router_screen">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wordlists" element={<Lists />} />
              <Route path="/incorrectlists" element={<IncorrectLists />} />
              <Route path="/lists/:id" element={<Words />} />
              <Route path="/auth" element={<Auth />} />
              {/* <Route path="/incorectlists/:id" element={<IncorrectWords />} /> */}
            </Routes>
          </ErrorBoundary>
          {/* <TestZone /> */}
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
