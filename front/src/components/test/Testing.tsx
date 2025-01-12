import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// types
import {
  Word,
  List,
  ReduxState,
  FetchDataReturn,
  TestingData,
} from "../../types/index";

import { FaPlus, FaEdit } from "react-icons/fa";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { IoTrashBin, IoShuffle } from "react-icons/io5";
import { GiConfirmed } from "react-icons/gi";
import { IoMdExit } from "react-icons/io";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

import "./Testing.scss";

import TestWordBox from "./small/TestWordBox";

const Testing: React.FC = () => {
  const navigate = useNavigate();
  const [testingData, setTestingData] = useState<TestingData>(null);
  const [isMemoShowActive, setIsMemoShowActive] = useState<boolean>(false);
  const [isWordShowActive, setIsWordShowActive] = useState<boolean>(false);
  const [isMeanShowActive, setIsMeanShowActive] = useState<boolean>(false);
  const [isEditModeActive, setIsEditModeActive] = useState<boolean>(false);
  const [isAnswerShowActive, setIsAnswerShowActive] = useState<boolean>(false);

  const currentWord: Word =
    testingData?.data?.wordsData[testingData?.data?.nowIndex];
  const currentList: List = testingData?.data?.listsData?.find(
    (list) => list._id === currentWord?.list_id
  );
  const language: string = currentList?.language;

  useEffect(() => {
    const data: TestingData = JSON.parse(
      localStorage.getItem("testingData") || "null"
    );

    if (!data) {
      navigate("/tests");
    } else {
      setTestingData(data);

      if (data.testMode === "wordToMean") {
        setIsWordShowActive(true);
        setIsMeanShowActive(false);
      } else if (data.testMode === "meanToWord") {
        setIsWordShowActive(false);
        setIsMeanShowActive(true);
      } else {
        setIsWordShowActive(false);
        setIsMeanShowActive(false);
      }
    }
  }, [navigate, setIsMeanShowActive, setIsWordShowActive]);

  const changeIndex = (direction: "prev" | "next") => {
    if (!testingData) return;

    const maxIndex = testingData?.data.chosenOptionData.length - 1;
    let newIndex = testingData?.data.nowIndex;

    if (direction === "prev") {
      if (newIndex > 0) {
        newIndex -= 1;
      } else {
        alert("Cannot decrease further. Already at the first item.");
        return;
      }
    } else if (direction === "next") {
      if (newIndex < maxIndex) {
        newIndex += 1;
      } else {
        alert("Cannot increase further. Already at the last item.");
        return;
      }
    }

    setTestingData((prevData) => {
      if (!prevData) return prevData;

      const updatedData = {
        ...prevData,
        data: {
          ...prevData.data,
          nowIndex: newIndex,
        },
      };

      localStorage.setItem("testingData", JSON.stringify(updatedData));

      return updatedData;
    });
    console.log(newIndex);
  };

  const toggleMemoShowActive = (): void => {
    setIsMemoShowActive((prev: boolean): boolean => !prev);
  };

  const toggleEditModeActive = (): void => {
    setIsEditModeActive((prev: boolean): boolean => !prev);
  };

  const activeAnswerWithDelay = (): void => {
    setIsAnswerShowActive(true);

    if (!isMeanShowActive) {
      setIsMeanShowActive(true);
      setTimeout(() => {
        setIsMeanShowActive(false);
      }, 500);
    }

    if (!isWordShowActive) {
      setIsWordShowActive(true);
      setTimeout(() => {
        setIsWordShowActive(false);
      }, 500);
    }

    setTimeout(() => {
      setIsAnswerShowActive(false);
    }, 500);
  };

  const updateEditedWordFromProps = (word: Word): void => {
    setTestingData((prevData) => {
      if (!prevData) return prevData;

      const updatedWordsData = prevData.data.wordsData.map((item) =>
        item._id === word._id ? { ...word } : item
      );

      const updatedData = {
        ...prevData,
        data: {
          ...prevData.data,
          wordsData: updatedWordsData,
        },
      };

      localStorage.setItem("testingData", JSON.stringify(updatedData));

      return updatedData;
    });
  };

  return (
    <div className="container_testing">
      {/* <p>{JSON.stringify(testingData)}</p> */}
      <p>{testingData?.data?.nowIndex}</p>
      <p>{JSON.stringify(currentWord)}</p>
      <p>{JSON.stringify(currentList)}</p>
      <button
        onClick={() => {
          changeIndex("prev");
        }}
      >
        prev
      </button>
      <button
        onClick={() => {
          changeIndex("next");
        }}
      >
        next
      </button>
      {testingData && testingData.data && (
        <div className="question-header">
          {testingData?.data?.nowIndex + 1}번 문제
        </div>
      )}
      {testingData && testingData.data && (
        <div className="quetion-contents">
          <TestWordBox
            {...currentWord}
            isWordShowActive={isWordShowActive}
            isMeanShowActive={isMeanShowActive}
            isMemoShowActive={isMemoShowActive}
            isSelected={true}
            isEditModeActive={isEditModeActive}
            list_id={currentWord.list_id}
            language={language}
            incorrectList_id={currentList?.linked_incorrect_word_lists[0]}
            updateEditedWordFromProps={updateEditedWordFromProps}
          />
        </div>
      )}
      {testingData && testingData.data && (
        <div className="question-options">options</div>
      )}
      {testingData && (
        <div className="question-btns">
          <div className={`side-btns `}>
            <div
              className={`side-btn ${isAnswerShowActive ? "active" : ""} `}
              onClick={activeAnswerWithDelay}
            >
              {isAnswerShowActive ? (
                <FaRegEye className="icon" />
              ) : (
                <FaRegEyeSlash className="icon" />
              )}
              <p>answer</p>
            </div>

            <div
              className={`side-btn ${isMemoShowActive ? "active" : ""}`}
              onClick={toggleMemoShowActive}
            >
              {isMemoShowActive ? (
                <FaRegEye className="icon" />
              ) : (
                <FaRegEyeSlash className="icon" />
              )}
              <p>memo</p>
            </div>

            <div
              className={`side-btn ${isEditModeActive ? "active" : ""}`}
              onClick={toggleEditModeActive}
            >
              <FaEdit className="icon" />
              <p>edit</p>
            </div>
          </div>
          <div
            className={"btn big"}
            onClick={() => {
              changeIndex("prev");
            }}
          >
            <MdNavigateBefore className="icon" />
          </div>
          <div className="btn small">
            <IoMdExit className="icon" />
          </div>
          <div className="btn small">
            <GiConfirmed className="icon" />
          </div>

          <div
            className={`btn big `}
            onClick={() => {
              changeIndex("next");
            }}
          >
            <MdNavigateNext className="icon" />
          </div>
        </div>
      )}
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
      <h1>테스트</h1>
    </div>
  );
};

export default Testing;
