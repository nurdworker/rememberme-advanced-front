import React from "react";
import { useLocation } from "react-router-dom";

const Preparation: React.FC = () => {
  const location = useLocation();
  console.log("hello preparation");
  const queryParams = new URLSearchParams(location.search);
  const paramValue = queryParams.get("paramName");
  alert(paramValue);
  return (
    <div className="container_preparation">
      <h1>테스트 준비 고고고</h1>
    </div>
  );
};

export default Preparation;
