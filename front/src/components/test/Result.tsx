import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// css
import "./Result.scss";

// custom
import { staticData } from "../../staticData";
import { useQueue } from "../../QueueContext";

// types
import { ReduxState, Word, List, TestResult } from "../../types/index";

//icons
import { FaPlus } from "react-icons/fa";
import { GrSubtractCircle } from "react-icons/gr";
import { MdDisabledByDefault } from "react-icons/md";

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const test_id: string | null = searchParams.get("test_id");
  const dispatch = useDispatch();

  const { editedWordsQueue } = useQueue();

  const words: Word[] = useSelector(
    (state: ReduxState) => state.data.words || []
  );
  const lists: List[] = useSelector(
    (state: ReduxState) => state.data.lists || []
  );

  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const score: string = `${
    testResult?.wordsCount - testResult?.wrongQuestions.length
  } / ${testResult?.wordsCount}`;

  const checkedValidTestResults =
    useCallback(async (): Promise<TestResult | void> => {
      if (!test_id) {
        navigate("/tests");
        return;
      }

      const testResults: TestResult[] = JSON.parse(
        localStorage.getItem("testResults") || "[]"
      );

      const testResult: TestResult | undefined = testResults.find(
        (result: TestResult) => result.test_id === test_id
      );

      if (testResult) {
        return testResult;
      } else {
        navigate("/tests");
      }
    }, [test_id, navigate]);

  const extractWordsData = useCallback(async () => {
    const testResult = await checkedValidTestResults();
    if (!testResult) return;

    const updatedWrongQuestions = testResult.wrongQuestions.map((question) => {
      const matchingWord = words.find(
        (word) => word._id === question.wordData._id
      );

      if (!matchingWord) return question;

      const isDifferent = Object.keys(matchingWord).some(
        (key) =>
          matchingWord[key as keyof typeof matchingWord] !==
          question.wordData[key as keyof typeof question.wordData]
      );

      if (isDifferent) {
        return {
          ...question,
          wordData: matchingWord,
        };
      }

      return question;
    });

    setTestResult((prevTestResult) => {
      if (prevTestResult && prevTestResult.test_id === testResult.test_id) {
        return prevTestResult;
      }

      return {
        ...testResult,
        wrongQuestions: updatedWrongQuestions,
      };
    });
  }, [words, checkedValidTestResults]);

  useEffect(() => {
    console.log("test useEffect");
    const asyncHandler = async () => {
      await extractWordsData();
    };
    asyncHandler();
  }, [extractWordsData]);

  const scoreClass = (score) => {
    const [numerator, denominator] = score.split("/").map(Number);

    const ratio = numerator / denominator;

    if (ratio < 0.4) {
      return "fail";
    } else if (ratio < 0.8) {
      return "notice";
    } else if (ratio < 0.9) {
      return "success";
    } else {
      return "perfect";
    }
  };

  const linkedIncorrectListIdOfWordList = (word: Word): string | false => {
    const { list_id } = word;

    const foundList = lists.find((list) => list._id === list_id);

    if (foundList && foundList.linked_incorrect_word_lists?.[0]) {
      return foundList.linked_incorrect_word_lists[0];
    }

    return false;
  };

  const updatedTestResult = (updatedWord: Word): TestResult => {
    const updatedResult: TestResult = { ...testResult };

    updatedResult.wrongQuestions = updatedResult.wrongQuestions.map(
      (wrongQuestion) => {
        if (wrongQuestion.wordData._id === updatedWord._id) {
          return {
            ...wrongQuestion,
            wordData: updatedWord,
          };
        }
        return wrongQuestion;
      }
    );

    return updatedResult;
  };

  const updatedTestResults = (testResult: TestResult): TestResult[] => {
    const testResults = localStorage.getItem("testResults");

    const parsedResults: TestResult[] = testResults
      ? JSON.parse(testResults)
      : [];

    const updatedResults = parsedResults.map((result) =>
      result.test_id === testResult.test_id ? testResult : result
    );

    return updatedResults;
  };

  const handleAddWordInIncorrectList = (word: Word): void => {
    const incorrectList_id = linkedIncorrectListIdOfWordList(word);

    if (typeof incorrectList_id === "string") {
      const updatedWord: Word = {
        ...word,
        is_incorrect: true,
        incorrect_lists: word.incorrect_lists.includes(incorrectList_id)
          ? word.incorrect_lists
          : [...word.incorrect_lists, incorrectList_id],
      };
      const updatedWordsArray = staticData.updatedWordsArray(
        words,
        updatedWord
      );
      dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
      const newTestResult: TestResult = updatedTestResult(updatedWord);
      setTestResult(newTestResult);
      const newTestResults = JSON.stringify(updatedTestResults(newTestResult));
      localStorage.setItem("testResults", newTestResults);
      editedWordsQueue.enqueue(updatedWord);
    } else {
      return;
    }
  };

  const goToList = (list_id) => {
    navigate(`/lists/${list_id}`);
  };

  const handleSubtractWordInFromcorrectList = (word: Word): void => {
    const incorrectList_id = linkedIncorrectListIdOfWordList(word);

    if (typeof incorrectList_id === "string") {
      const updatedWord: Word = {
        ...word,
        is_incorrect: false,
        incorrect_lists: word.incorrect_lists.filter(
          (listId: string) => listId !== incorrectList_id
        ),
      };
      const updatedWordsArray = staticData.updatedWordsArray(
        words,
        updatedWord
      );
      dispatch({ type: "SET_DATA_WORDS", value: updatedWordsArray });
      const newTestResult: TestResult = updatedTestResult(updatedWord);
      setTestResult(newTestResult);
      const newTestResults = JSON.stringify(updatedTestResults(newTestResult));
      localStorage.setItem("testResults", newTestResults);
      editedWordsQueue.enqueue(updatedWord);
    } else {
      return;
    }
  };

  return (
    <div className="container_result">
      <div className="result-header">
        <div className="test-info">
          <div className="test-date">
            {testResult?.test_id
              ? new Date(Number(testResult.test_id)).toLocaleString("en-US")
              : ""}
          </div>
          <div className="result-score-box">
            <p className="title">score</p>
            <p className={`score ${scoreClass(score)}`}>{score}</p>
          </div>
        </div>

        <div className="test-lists">
          {testResult?.testList.map((list, index) => (
            <div
              key={index}
              className="list-name"
              onClick={() => {
                goToList(list.list_id);
              }}
            >
              <p>
                {list.name}{" "}
                {list.isIncorrect && (
                  <span className="is-incorrect">오답노트</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="result-contents column-header">
        {testResult?.wrongQuestions.map((question, index) => (
          <div className="result-word-card" key={index}>
            <p className="origin-word">{question.wordData.word}</p>
            <p className="origin-mean">{question.mean}</p>
            <p className="chosen-option">
              <MdDisabledByDefault />
              {question.chosenOption}
            </p>
            <p className="list-name">{question.listName}</p>
            <p className="incorrect-btn">
              {linkedIncorrectListIdOfWordList(question.wordData) && (
                <>
                  {question.wordData.is_incorrect === false && (
                    <button
                      className="side-btn add-incorrect"
                      onClick={() => {
                        handleAddWordInIncorrectList(question.wordData);
                      }}
                    >
                      <FaPlus className="icon" />
                    </button>
                  )}
                  {question.wordData.is_incorrect === true && (
                    <button
                      className="side-btn substract-incorrect"
                      onClick={() => {
                        handleSubtractWordInFromcorrectList(question.wordData);
                      }}
                    >
                      <GrSubtractCircle className="icon" />
                    </button>
                  )}
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Result;
