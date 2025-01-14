import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// types
import { Word, List, TestingData } from "../../types/index";

import { useFuncs } from "../../funcs";

import { FaEdit } from "react-icons/fa";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { GiConfirmed } from "react-icons/gi";
import { IoMdExit } from "react-icons/io";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

import "./Testing.scss";

import TestWordBox from "./small/TestWordBox";

import ConfirmAlertModal from "../../components/small/ConfirmAlertModal";

const GaugeComponent = ({ data }: { data: (string | null)[] }) => {
  const totalItems = data.length;
  const filledItems = data.filter((item) => item !== null).length;
  const progress = (filledItems / totalItems) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-center mt-2">{`Progress: ${filledItems}/${totalItems} (${Math.round(
        progress
      )}%)`}</p>
    </div>
  );
};

const Testing: React.FC = () => {
  const navigate = useNavigate();
  const [testingData, setTestingData] = useState<TestingData>(null);
  const [isMemoShowActive, setIsMemoShowActive] = useState<boolean>(false);
  const [isWordShowActive, setIsWordShowActive] = useState<boolean>(false);
  const [isMeanShowActive, setIsMeanShowActive] = useState<boolean>(false);
  const [isEditModeActive, setIsEditModeActive] = useState<boolean>(false);
  const [isAnswerShowActive, setIsAnswerShowActive] = useState<boolean>(false);

  const [isExitConfirmAlert, setIsExitConfirmAlert] = useState<boolean>(false);
  const [isSubmitConfirmAlert, setIsSubmitConfirmAlert] =
    useState<boolean>(false);

  const { showAlert } = useFuncs();

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
        showAlert("Cannot decrease further. \nAlready at the first item.");
        return;
      }
    } else if (direction === "next") {
      if (newIndex < maxIndex) {
        newIndex += 1;
      } else {
        showAlert("Cannot increase further.\nAlready at the last item.");
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        changeIndex("prev");
      } else if (event.key === "ArrowRight") {
        changeIndex("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeIndex]);

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

  const handleSelectOption = (selectedOption: string): void => {
    setTestingData((prevData) => {
      const updatedData = {
        ...prevData,
        data: {
          ...prevData.data,
          chosenOptionData: prevData.data.chosenOptionData.map((item, index) =>
            index === prevData.data.nowIndex ? selectedOption : item
          ),
        },
      };

      localStorage.setItem("testingData", JSON.stringify(updatedData));

      return updatedData;
    });

    console.log(selectedOption);
  };

  const handleExitTest = (): void => {
    setIsExitConfirmAlert(true);
    setIsSubmitConfirmAlert(false);
  };

  const handleSubmitTest = (): void => {
    const chosenOptionData = testingData.data.chosenOptionData;

    if (chosenOptionData) {
      const firstNullIndex = chosenOptionData.findIndex(
        (item) => item === null
      );
      if (firstNullIndex !== -1) {
        console.log(`First null value found at index: ${firstNullIndex}`);
        showAlert(
          `You have not selected an option for question number ${
            firstNullIndex + 1
          }!`
        );

        const updatedTestingData = {
          ...testingData,
          data: {
            ...testingData.data,
            nowIndex: firstNullIndex,
          },
        };

        setTestingData(updatedTestingData);

        localStorage.setItem("testingData", JSON.stringify(updatedTestingData));

        return;
      }
    }

    setIsSubmitConfirmAlert(true);
    setIsExitConfirmAlert(false);

    navigate(`/tests?mode=result&test_id=${testingData.test_id}`);
  };

  const joinToList = (list_id: string, isIncorrect: boolean): void => {
    if (isIncorrect) {
      navigate(`/lists/${list_id}?isIncorrectList=true`);
    } else {
      navigate(`/lists/${list_id}`);
    }
  };

  const listTitle = (list_id: string): string => {
    const list = testingData?.data?.listsData.find(
      (item) => item._id === list_id
    );
    return list ? list.name : "Unknown List";
  };

  const handleExitConfirm = (): void => {
    console.log("Exit confirmed");
    setIsExitConfirmAlert(false);
    localStorage.removeItem("testingData");
    navigate("/");
  };

  const handleExitCancel = (): void => {
    console.log("Exit cancelled");
    setIsExitConfirmAlert(false);
  };

  // Submit Confirm 관련 함수들
  const handleSubmitConfirm = (): void => {
    console.log("Submit confirmed");
    setIsSubmitConfirmAlert(false);
  };

  const handleSubmitCancel = (): void => {
    console.log("Submit cancelled");
    setIsSubmitConfirmAlert(false);
  };
  return (
    <div className="container_testing">
      {isExitConfirmAlert && (
        <ConfirmAlertModal
          message="Are you sure you want to exit? /n If you leave, the exam data cannot be recovered."
          onConfirm={handleExitConfirm}
          onCancel={handleExitCancel}
        />
      )}

      {isSubmitConfirmAlert && (
        <ConfirmAlertModal
          message="Are you sure you want to submit?"
          onConfirm={handleSubmitConfirm}
          onCancel={handleSubmitCancel}
        />
      )}
      {/* <p>{JSON.stringify(testingData)}</p> */}
      {/* <p>{testingData?.data?.nowIndex}</p> */}
      {/* <pre>{JSON.stringify(currentWord, null, 2)}</pre>
      <pre>{JSON.stringify(currentList, null, 2)}</pre> */}
      {/* <button onClick={testtest}>123123123</button> */}
      {testingData && testingData.data && (
        <div className="question-header">
          <div className="question-main-info">
            <h1 className="testing-question-number">
              # {testingData?.data?.nowIndex + 1}
            </h1>
            <div className="testing-lists-info">
              {testingData?.testLists.map((item) => (
                <p
                  className="list-name"
                  key={item.list_id}
                  onClick={() => {
                    joinToList(item.list_id, item.isIncorrect);
                  }}
                >
                  {listTitle(item.list_id)}
                  {item.isIncorrect && (
                    <span className="is-incorrect">오답노트</span>
                  )}
                </p>
              ))}
              {/* {JSON.stringify(testingData.testLists)}
              {JSON.stringify(testingData.data.listsData)} */}
            </div>
          </div>

          <div className="testing-guage flex justify-center items-center">
            <GaugeComponent data={testingData.data.chosenOptionData} />
          </div>
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
        <div className="question-options">
          {/* <pre>
            {JSON.stringify(
              testingData.data.optionData[testingData.data.nowIndex],
              null,
              2
            )}
          </pre> */}
          {/* <pre>
            {JSON.stringify(testingData.data.chosenOptionData, null, 2)}
          </pre> */}
          {testingData.data.optionData[testingData.data.nowIndex]?.map(
            (option: string, index: number) => (
              <div
                className={`option-card ${
                  testingData.data.chosenOptionData[
                    testingData.data.nowIndex
                  ] === option
                    ? "selected"
                    : ""
                }`}
                key={index}
                onClick={() => handleSelectOption(option)}
              >
                <p>{option}</p>
              </div>
            )
          )}
        </div>
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
          <div className="btn small" onClick={handleExitTest}>
            <IoMdExit className="icon" />
          </div>
          <div className="btn small" onClick={handleSubmitTest}>
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
    </div>
  );
};

export default Testing;
