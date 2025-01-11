import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Tests: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  console.log("hello tests");
  const searchParams = new URLSearchParams(location.search);

  const startTest = (): void => {
    console.log("start test");
    searchParams.set("mode", "preparation");

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };
  return (
    <div className="container_tests">
      <div className="start-test-box">
        <button onClick={startTest}>시험볼래요~</button>
      </div>
      <div className="history">단어장 기록</div>
    </div>
  );
};

export default Tests;
