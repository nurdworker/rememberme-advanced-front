import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import "./Preparation.scss";

import { staticData } from "../../staticData";
// custom
import { useFuncs } from "../../funcs";
// types
import {
  Word,
  List,
  ReduxState,
  FetchDataReturn,
  TestingData,
} from "../../types/index";

import { SlNotebook } from "react-icons/sl";
import { IoMdRefresh } from "react-icons/io";
import { FaNoteSticky } from "react-icons/fa6";

const Preparation: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const directListId: string | null = searchParams.get("list_id");
  const isDirectListIncorrect: string | null = searchParams.get(
    "is_direct_list_incorrect"
  );
  const navigate = useNavigate();
  const { fetchWordsData, showAlert } = useFuncs();

  const lists: List[] = useSelector((state: ReduxState) => state.data.lists);
  const words: Word[] = useSelector((state: ReduxState) => state.data.words);

  const [checkedLists, setCheckedLists] = useState<
    { list_id: string; isIncorrect: boolean }[]
  >([]);
  const [refreshedLists, setRefreshedLists] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>("wordToMean");

  useEffect(() => {
    if (directListId && isDirectListIncorrect) {
      const isIncorrect = isDirectListIncorrect === "true";

      setCheckedLists((prevCheckedLists) => [
        ...prevCheckedLists,
        { list_id: directListId, isIncorrect },
      ]);
    }
  }, [directListId, isDirectListIncorrect]);
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

  const incorrectWordsCount = (list_id: string): number => {
    return words.filter((word) => word.list_id === list_id && word.is_incorrect)
      .length;
  };

  const totalWordsCount = (): number => {
    return checkedLists.reduce((total, item) => {
      if (item.isIncorrect) {
        return total + incorrectWordsCount(item.list_id);
      } else {
        return total + wordsCount(item.list_id);
      }
    }, 0);
  };

  const listTitle = (list_id: string): string => {
    const list: List = lists.find((list) => list._id === list_id);
    return list ? list.name : "";
  };

  const checkWordsAndfetchWords = useCallback(
    async (list_id: string): Promise<void> => {
      const isListWordsInStore: boolean = words.some(
        (word: Word) => word.list_id === list_id
      );

      if (!isListWordsInStore) {
        const fetchingResult: FetchDataReturn = await fetchWordsData(
          list_id,
          "block"
        );
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

  const handleRefreshButtonClick = (list_id: string) => {
    if (!refreshedLists.includes(list_id)) {
      setRefreshedLists((prev) => [...prev, list_id]);
      refreshWordsCount(list_id);
    }
  };

  const refreshWordsCount = async (list_id): Promise<void> => {
    await checkWordsAndfetchWords(list_id);
  };

  const handleModeSelection = (mode: string) => {
    setSelectedMode(mode);
  };
  const [test1, setTest1] = useState(null);
  const [test2, setTest2] = useState(null);
  const [test3, setTest3] = useState(null);

  const generateOptionData = (
    testMode: string,
    wordsData: Word[]
  ): string[][] => {
    return testMode === "wordToMean"
      ? wordsData.map((currentWord) => {
          const allMeans = wordsData.map((word) => word.mean);
          const randomMeans = generateRandomOptions(allMeans, currentWord.mean);
          return randomMeans;
        })
      : testMode === "meanToWord"
      ? wordsData.map((currentWord) => {
          const allWords = wordsData.map((word) => word.word);
          const randomWords = generateRandomOptions(allWords, currentWord.word);
          return randomWords;
        })
      : [];
  };

  const generateRandomOptions = (
    allOptions: string[],
    correctOption: string,
    optionCount: number = 5
  ): string[] => {
    const randomOptions = new Set([correctOption]);

    // 나머지 틀린 보기들을 추가
    while (randomOptions.size < optionCount) {
      const randomIndex = Math.floor(Math.random() * allOptions.length);
      randomOptions.add(allOptions[randomIndex]);
    }

    return Array.from(randomOptions).sort(() => Math.random() - 0.5);
  };

  const filterWordsByCheckedLists = async (): Promise<Word[]> => {
    const wordsData: Word[] = [];

    checkedLists.forEach(({ list_id, isIncorrect }) => {
      const filteredWords: Word[] = words.filter((word: Word) => {
        if (word.list_id !== list_id) return false;

        if (isIncorrect) {
          return word.is_incorrect === true;
        }
        return true;
      });

      wordsData.push(...filteredWords);
    });

    const shuffledWords: Word[] = wordsData.sort(() => Math.random() - 0.5);

    return shuffledWords;
  };

  const generateCorrectAnswers = async (
    wordsData: Word[],
    testMode: string
  ): Promise<string[]> => {
    return wordsData.map((word) => {
      if (testMode === "wordToMean") {
        return word.mean;
      } else if (testMode === "meanToWord") {
        return word.word;
      }
    });
  };

  const checkingTestPreparation = async (): Promise<boolean> => {
    if (checkedLists.length === 0) {
      showAlert("The selected list is empty.");
      return false;
    }
    if (totalWordsCount() < 5) {
      showAlert("Choose more words.");
      return false;
    }
    if (totalWordsCount() > 100) {
      showAlert("Words are too many.");
      return false;
    }
    return true;
  };

  const filteredLists = checkedLists
    .map(({ list_id }) => {
      return lists.filter((list) => list._id === list_id);
    })
    .flat();

  const handleStartTest = async (): Promise<void> => {
    if (await checkingTestPreparation()) {
      const wordsData: Word[] = await filterWordsByCheckedLists();
      const listsData: List[] = filteredLists;
      const optionData: string[][] = await generateOptionData(
        selectedMode,
        wordsData
      );
      const correctOptionData: string[] = await generateCorrectAnswers(
        wordsData,
        selectedMode
      );
      const chosenOptionData: (string | null)[] = new Array(
        correctOptionData.length
      ).fill(null);

      // setTest1(wordsData);
      // setTest2(optionData);
      // setTest3(correctOptionData);

      const testingData: TestingData = {
        test_id: Date.now().toString(),
        testLists: [...checkedLists],
        testMode: selectedMode,
        data: {
          nowIndex: 0,
          listsData,
          wordsData,
          optionData,
          correctOptionData,
          chosenOptionData,
        },
      };

      localStorage.setItem("testingData", JSON.stringify(testingData));
      showAlert("Starting the test. Good luck!");
      navigate("/tests?mode=testing");
    }
  };

  return (
    <div className="container-preparation">
      {/* <p>{JSON.stringify(checkedLists)}</p> */}
      {/* <p>{JSON.stringify(lists)}</p> */}
      {/* <p>{JSON.stringify(words)}</p> */}
      {/* <pre>{JSON.stringify(test1, null, 2)}</pre>
      <p>끊어어</p>
      <pre>{JSON.stringify(test2, null, 2)}</pre>
      <p>끊어어</p>

      <pre>{JSON.stringify(test3, null, 2)}</pre>
      {selectedMode} */}
      <nav className="preparation-nav">
        <div className="preparation-contents">
          {checkedLists.length === 0 ? (
            <div className="empty-message">please select lists..</div>
          ) : (
            checkedLists.map((item) => (
              <div className="preparation-summary">
                <h5>{listTitle(item.list_id)}</h5>
                {item.isIncorrect && <span>오답노트</span>}
              </div>
            ))
          )}
        </div>

        <div className="preparation-btn" onClick={handleStartTest}>
          <p>{totalWordsCount()} Words</p>
          <p>Start Test!</p>
        </div>
      </nav>
      <div className="preparation-title">Select test mode!</div>
      <div className="preparation-select-mode">
        <button
          className={`mode-button ${
            selectedMode === "wordToMean" ? "selected" : ""
          }`}
          onClick={() => handleModeSelection("wordToMean")}
        >
          From Word to Mean
        </button>

        <button
          className={`mode-button ${
            selectedMode === "meanToWord" ? "selected" : ""
          }`}
          onClick={() => handleModeSelection("meanToWord")}
        >
          From Mean to Word
        </button>

        {/* 선택된 모드를 표시 */}
      </div>
      <div className="preparation-title">Select your word lists!</div>
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
                    {wordsCount(list._id) === 0 &&
                      !refreshedLists.includes(list._id) && (
                        <div
                          className="list-btn refresh-words"
                          onClick={() => {
                            handleRefreshButtonClick(list._id);
                            refreshWordsCount(list._id);
                          }}
                        >
                          <IoMdRefresh className="icon" />
                        </div>
                      )}
                    {wordsCount(list._id) > 0 && (
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
                    )}
                    {list.linked_incorrect_word_lists.length > 0 &&
                      incorrectWordsCount(list._id) > 0 && (
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
                          <FaNoteSticky className="icon" />
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
