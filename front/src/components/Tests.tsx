import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// components
import Preparation from "./test/Preparation";

const Tests: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  console.log("hello tests");
  const searchParams = new URLSearchParams(location.search);

  const [isPreparation, setIsPreparation] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isTestsBoard, setIsTestsBoard] = useState<boolean>(false);
  const [isResult, setIsResult] = useState<boolean>(false);

  const mode: string | null = searchParams.get("mode");
  console.log(mode);

  const startTest = (): void => {
    searchParams.set("mode", "preparation");

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };
  return (
    <div className="container_tests">
      {mode === "preparation" && (
        <div className="screen">{<Preparation />}</div>
      )}
      {mode === null && (
        <div className="screen">
          <div className="start-test-box flex justify-center items-center mt-8">
            <button
              onClick={startTest}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:bg-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 active:bg-blue-700"
            >
              Let's take an exam!
            </button>
          </div>

          <div className="history">단어장 기록</div>
        </div>
      )}
    </div>
  );
};

export default Tests;
