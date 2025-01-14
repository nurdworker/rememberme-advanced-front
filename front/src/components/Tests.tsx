// import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// components
import Preparation from "./test/Preparation";
import Testing from "./test/Testing";

import { staticData } from "../staticData";

const Tests: React.FC = () => {
  // default
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const mode: string | null = searchParams.get("mode");
  console.log(mode);

  const startTest = (): void => {
    searchParams.set("mode", "preparation");

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  const testtest = (): void => {
    console.log(
      staticData.checkFormFuncs.checkTestingDataForm(
        JSON.parse(localStorage.getItem("testingData"))
      )
    );
  };

  return (
    <div className="container_tests">
      {mode === "preparation" && (
        <div className="screen">{<Preparation />}</div>
      )}
      {mode === "testing" && <div className="screen">{<Testing />}</div>}
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
              폼체크 함수
            </button>
          </div>

          <div className="history">단어장 기록</div>
        </div>
      )}
    </div>
  );
};

export default Tests;
