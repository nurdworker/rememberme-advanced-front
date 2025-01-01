// public modules
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// css
import "./Lists.scss";

// custom
import { useFuncs } from "../funcs";
import { useQueue } from "../QueueContext";
import { staticData } from "../staticData";

// components
import CreateListModal from "./small/CreateListModal";
import ListBox from "./small/ListBox";

// icons
import { FaPlus } from "react-icons/fa";
import { IoTrashBin } from "react-icons/io5";

// type
interface List {
  _id: string;
  name: string;
  creation_date: string;
  language: string;
  linked_incorrect_word_lists: any[];
  is_bookmark: boolean;
  user_id: string;
  is_deleted: boolean;
}

const Lists = () => {
  //default
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //mode state
  const isSign = useSelector((state: any) => state?.mode.isSign);
  const isFetching = useSelector((state: any) => state.mode.isFetching);
  const isMobile = useSelector((state: any) => state.mode.isMobile);

  //public data
  const lists = useSelector((state: any) => state.data.lists);
  const { editedListsQueue } = useQueue();

  //component state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListIds, setselectedListIds] = useState<string[]>([]);

  //custom hook funcs
  const { fetchListsData } = useFuncs();

  //etc
  let clickTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    const asyncHandler = async () => {
      if (!lists || lists.length === 0) {
        // 어레이가 빈값일경우
        const fetchingResult = await fetchListsData();
        console.log(1);
        if (fetchingResult?.message === "success") {
          // 2. 새로운 사용자일경우
          console.log("fetching is succeed");
          console.log(2);

          return;
        } else if (fetchingResult?.message === "processing") {
          // 2. 이미 fetching중일경우
          console.log(3);

          console.log("fetching is processing");
          return;
        } else {
          // 1. fetch가 안되었을경우
          console.log(4);

          console.log("fetching is on error");
          navigate("/");
        }
      }
    };
    asyncHandler();
  }, [fetchListsData, lists, navigate]);

  // click handlers
  const handleClick = (list_id: string) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }

    clickTimeout = setTimeout(() => {
      if (!clickTimeout) return;
      console.log("Single Click");
      navigate(`/lists/${list_id}`);
    }, 500);
  };

  const handleDoubleClick = (list: List) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }

    setselectedListIds((prev) => {
      if (prev.includes(list._id)) {
        return prev.filter((id) => id !== list._id);
      }

      if (prev.length >= staticData.max_list_queue_count) {
        alert(`queue counts ${staticData.max_list_queue_count} is exceed`);
        return prev;
      }

      return [...prev, list._id];
    });

    console.log("Double Click");
  };

  // buttons funcs
  const deleteLists = () => {
    if (!selectedListIds || selectedListIds.length === 0) {
      console.log("there is not selected");
      return;
    }

    const updatedLists = lists.map((list: List) => {
      if (selectedListIds.includes(list._id)) {
        return { ...list, is_deleted: true };
      }
      return list;
    });

    dispatch({
      type: "SET_DATA_LISTS",
      value: updatedLists,
    });

    setselectedListIds([]);

    selectedListIds.forEach((id) => {
      const listToDelete = lists.find((list: List) => list._id === id);
      if (listToDelete) {
        const updatedList = { ...listToDelete, is_deleted: true };
        editedListsQueue.enqueue(updatedList);
      } else {
        console.log(`List with id ${id} not found`);
      }
    });
  };

  const toggleCreateModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // drag funcs
  const handleDragStart = (start: any) => {
    // 만약 드래그중인 데이터가 필요할경우 사용하세여
    const draggedList = lists.find(
      (list: List) => list._id === start.draggableId
    );
    console.log(draggedList);
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    console.log("destination:", destination);

    if (!destination) return;

    if (destination.index === source.index) return;

    const draggedItem = lists.find((list: List) => list._id === draggableId);

    if (!draggedItem) {
      console.error("List not found for the given draggableId");
      return;
    }

    if (destination.droppableId === "wordLists") {
      // is_deleted가 false인 항목만 필터링
      const activeLists = lists.filter((list: List) => !list.is_deleted);

      // activeLists에서만 재정렬
      const reorderedLists = [...activeLists];

      // 삭제된 항목을 빼고 순서 변경
      const [removedItem] = reorderedLists.splice(source.index, 1); // 삭제
      reorderedLists.splice(destination.index, 0, removedItem); // 삽입

      console.log(
        "Reordered Lists Names:",
        reorderedLists.map((list: List) => list.name)
      );

      // 로컬스토리지에 업데이트된 순서 저장
      const reorderedIds = reorderedLists.map((list: List) => list._id);

      // 로컬스토리지에 순서 저장
      localStorage.setItem("reorderedLists", JSON.stringify(reorderedIds));

      // 디스패치하여 상태 업데이트
      dispatch({ type: "SET_DATA_LISTS", value: reorderedLists });
    }
  };

  return (
    <div className={`container_lists ${isMobile ? "mobile" : "desktop"}`}>
      <CreateListModal isOpen={isModalOpen} closeModal={toggleCreateModal} />
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="contents-lists">
          {!isFetching && isSign && (
            <Droppable droppableId="wordLists">
              {(provided) => (
                <div
                  className="lists"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    width: "100%",
                    overflow: "auto",
                  }}
                >
                  {lists && lists.length > 0 ? (
                    lists
                      .filter((list: List) => !list.is_deleted)
                      .map((list: List, index: number) => (
                        <Draggable
                          key={list._id}
                          draggableId={list._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="list-box-drag"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                width: isMobile ? "90%" : "300px",
                                margin: "3px",
                              }}
                            >
                              <div
                                className="list-box-select"
                                style={{
                                  margin: "1px",
                                  borderRadius: "5px",
                                  transform: selectedListIds.includes(list._id)
                                    ? "scale(1.05)"
                                    : "none",

                                  transition: "transform 0.2s ease",
                                }}
                                onClick={() => handleClick(list._id)}
                                onDoubleClick={() => handleDoubleClick(list)}
                              >
                                <ListBox
                                  {...list}
                                  isSelected={selectedListIds.includes(
                                    list._id
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                  ) : (
                    <p>No word lists</p>
                  )}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
        <div className="btns">
          <div className="btn" onClick={toggleCreateModal}>
            <FaPlus className="icon" />
          </div>

          <div
            className={`btn ${
              selectedListIds.length > 0 ? "selectActive" : ""
            }`}
            onClick={deleteLists}
          >
            <IoTrashBin className="icon" />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default Lists;
