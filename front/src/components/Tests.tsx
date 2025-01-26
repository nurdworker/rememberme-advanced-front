// public modules
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// css
import "./Tests.scss";

// components
import Preparation from "./test/Preparation";
import Testing from "./test/Testing";
import Result from "./test/Result";

// custom
// import { staticData } from "../staticData";

// types
import { TestResult } from "../types/index";

const Tests: React.FC = () => {
  // default
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location]
  );

  // params
  const mode: string | null = searchParams.get("mode");

  //component state
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // useEffect
  useEffect(() => {
    const testingData = localStorage.getItem("testingData");
    if (testingData && mode !== "testing") {
      searchParams.set("mode", "testing");
      navigate({
        pathname: location.pathname,
        search: searchParams.toString(),
      });
    }
    const storedTestResults = localStorage.getItem("testResults");
    if (storedTestResults) {
      setTestResults(JSON.parse(storedTestResults));
    }
  }, [location, navigate, searchParams, mode]);

  //handlers
  const handleStartTest = (): void => {
    searchParams.set("mode", "preparation");

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  const handleGoToResult = (test_id: string): void => {
    navigate(`/tests?mode=result&test_id=${test_id}`);
  };

  // history funcs
  const calculateScore = (testResult: TestResult): string => {
    return `${testResult.wordsCount - testResult.wrongQuestions.length} / ${
      testResult.wordsCount
    }`;
  };

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
    <div className="container_tests">
      {mode === "preparation" && (
        <div className="screen">{<Preparation />}</div>
      )}
      {mode === "testing" && <div className="screen">{<Testing />}</div>}
      {mode === "result" && <div className="screen">{<Result />}</div>}
      {!mode && (
        <div className="screen">
          <div className="start-test-box flex justify-center items-center mt-8">
            <button
              onClick={handleStartTest}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-110 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 active:scale-95"
            >
              Let's take an exam!
            </button>
          </div>

          <div className="history">
            {testResults
              .sort((a, b) => Number(b.test_id) - Number(a.test_id))
              .map((testResult, index) => (
                <div
                  key={index}
                  className="history-card"
                  onClick={() => {
                    handleGoToResult(testResult.test_id);
                  }}
                >
                  <p className="test-time">
                    {new Date(Number(testResult.test_id)).toLocaleString(
                      "en-US"
                    )}
                  </p>
                  <p
                    className={`test-score ${scoreClass(
                      calculateScore(testResult)
                    )}`}
                  >
                    {calculateScore(testResult)}
                  </p>
                  <div className="lists-info">
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
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;
