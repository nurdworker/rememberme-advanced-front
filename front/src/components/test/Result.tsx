import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// css
import "./Result.scss";

// custom
import { useFuncs } from "../../funcs";
import { staticData } from "../../staticData";

// types
import {
  ReduxState,
  Word,
  List,
  TestingData,
  TestResult,
} from "../../types/index";

//icons
import { FaPlus, FaWikipediaW } from "react-icons/fa";
import { GrSubtractCircle } from "react-icons/gr";

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const test_id: string | null = searchParams.get("test_id");

  const words: Word[] = useSelector(
    (state: ReduxState) => state.data.words || []
  );
  const dispatch = useDispatch();

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
    if (!testResult) return; // testResult가 없으면 함수 종료

    // testResult를 기반으로 wrongQuestions 배열을 업데이트
    const updatedWrongQuestions = testResult.wrongQuestions.map((question) => {
      // 리덕스 words에서 동일한 _id를 가진 객체 찾기
      const matchingWord = words.find(
        (word) => word._id === question.wordData._id
      );

      // matchingWord가 없으면 원래 객체 반환
      if (!matchingWord) return question;

      // 모든 프로퍼티를 비교하여 다르면 wordData 교체
      const isDifferent = Object.keys(matchingWord).some(
        (key) =>
          matchingWord[key as keyof typeof matchingWord] !==
          question.wordData[key as keyof typeof question.wordData]
      );

      if (isDifferent) {
        // wordData를 리덕스 words 객체로 교체
        return {
          ...question,
          wordData: matchingWord,
        };
      }

      // 동일하다면 변경하지 않음
      return question;
    });

    // 이전 testResult와 같은 경우 상태를 업데이트하지 않음
    setTestResult((prevTestResult) => {
      if (prevTestResult && prevTestResult.test_id === testResult.test_id) {
        // 동일한 testResult일 경우 상태 업데이트 방지
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

  console.log("hello test result");

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
            <div key={index} className="list-name">
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
            <p className="chosen-option">{question.chosenOption}</p>
            <p className="list-name">{question.listName}</p>
            <p className="incorrect-btn">
              <button className="side-btn add-incorrect">
                <FaPlus className="icon" />
              </button>
              <button className="side-btn substract-incorrect">
                <GrSubtractCircle className="icon" />
              </button>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Result;
