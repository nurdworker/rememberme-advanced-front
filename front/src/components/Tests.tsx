import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// components
import Preparation from "./test/Preparation";
import Testing from "./test/Testing";
import Result from "./test/Result";

import { staticData } from "../staticData";

const Tests: React.FC = () => {
  // default
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location]
  );

  const mode: string | null = searchParams.get("mode");
  console.log(mode);

  useEffect(() => {
    const testingData = localStorage.getItem("testingData");
    if (testingData && mode !== "testing") {
      searchParams.set("mode", "testing");
      navigate({
        pathname: location.pathname,
        search: searchParams.toString(),
      });
    }
  }, [location, navigate, searchParams, mode]);

  const startTest = (): void => {
    searchParams.set("mode", "preparation");

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  const testtest = (): void => {
    const testId = "1736865787024"; // test_id 값
    navigate(`/tests?mode=result&test_id=${testId}`);
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
              onClick={startTest}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:bg-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 active:bg-blue-700"
            >
              Let's take an exam!
            </button>

            <button
              onClick={testtest}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:bg-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 active:bg-blue-700"
            >
              결과창
            </button>
          </div>

          <div className="history">단어장 기록</div>
        </div>
      )}
    </div>
  );
};

export default Tests;
