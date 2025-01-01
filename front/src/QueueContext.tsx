// public modules
import React, { createContext, useContext, useState, useMemo } from "react";

// custom
import { staticData } from "./staticData";
import { useFuncs } from "./funcs";

// 큐 클래스를 관리하는 Queue
const QueueContext = createContext<any>(null);

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
};

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { sendApiToEditWords, sendApiToEditLists } = useFuncs();

  // useMemo로 커스텀 훅에서 반환된 함수들을 메모이제이션
  const sendApiToEditWordsMemo = useMemo(
    () => sendApiToEditWords,
    [sendApiToEditWords]
  );
  const sendApiToEditListsMemo = useMemo(
    () => sendApiToEditLists,
    [sendApiToEditLists]
  );

  // 큐를 관리하는 상태들
  const [editedListsQueue] = useState(
    new staticData.Queue<any>(
      sendApiToEditListsMemo,
      staticData.max_list_queue_count
    )
  );

  const [editedWordsQueue] = useState(
    new staticData.Queue<any>(
      sendApiToEditWordsMemo,
      staticData.max_word_queue_count
    )
  );

  return (
    <QueueContext.Provider value={{ editedListsQueue, editedWordsQueue }}>
      {children}
    </QueueContext.Provider>
  );
};
