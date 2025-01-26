// types
import { Word, List, TestingData, TestResult } from "./types/index";
class Node<T> {
  value: T;
  next: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export const staticData = {
  max_list_queue_count: 5,
  max_word_queue_count: 10,
  google_img:
    "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
  flag_imgs: {
    en: "https://raw.githubusercontent.com/lipis/flag-icons/e119b66129af6dd849754ccf25dfbf81d4a306d5/flags/1x1/us.svg",
    jp: "https://raw.githubusercontent.com/lipis/flag-icons/e119b66129af6dd849754ccf25dfbf81d4a306d5/flags/1x1/jp.svg",
    indo: "https://raw.githubusercontent.com/lipis/flag-icons/e119b66129af6dd849754ccf25dfbf81d4a306d5/flags/1x1/id.svg",
  },
  endpoint: process.env.REACT_APP_API_GATEWAY_ENDPOINT as string,
  updateListInArray: (lists: List[], updatedList: List) => {
    return lists.map((list) =>
      list._id === updatedList._id ? updatedList : list
    );
  },
  updatedWordsArray: (words: Word[], updatedWord: Word) => {
    return words.map((word) =>
      word._id === updatedWord._id ? updatedWord : word
    );
  },
  checkFormFuncs: {
    checkListForm: (list: List): list is List =>
      typeof list._id === "string" &&
      typeof list.name === "string" &&
      typeof list.language === "string" &&
      typeof list.user_id === "string" &&
      typeof list.creation_date === "string" &&
      Array.isArray(list.linked_incorrect_word_lists) &&
      list.linked_incorrect_word_lists.every((id) => typeof id === "string") &&
      typeof list.is_deleted === "boolean" &&
      typeof list.is_bookmark === "boolean",
    checkWordForm: (word: Word): word is Word =>
      typeof word._id === "string" &&
      typeof word.word === "string" &&
      typeof word.mean === "string" &&
      typeof word.list_id === "string" &&
      typeof word.user_id === "string" &&
      typeof word.creation_date === "string" &&
      typeof word.is_deleted === "boolean" &&
      typeof word.memo === "string" &&
      typeof word.is_incorrect === "boolean" &&
      Array.isArray(word.incorrect_lists) &&
      word.incorrect_lists.every((id) => typeof id === "string"),
    checkTestingDataForm: (
      testingData: TestingData
    ): testingData is TestingData => {
      if (!testingData) {
        console.log("testingData가 undefined 또는 존재하지 않음");
        return false;
      }
      // 1. test_id가 유닉스타임 형식의 숫자여야 함
      if (
        typeof testingData.test_id !== "string" ||
        isNaN(Number(testingData.test_id)) ||
        !/^\d{13}$/.test(testingData.test_id)
      ) {
        console.log("test_id 검증 실패");
        return false;
      }

      // 2. testLists 검사
      if (
        !Array.isArray(testingData.testLists) ||
        testingData.testLists.length === 0 ||
        !testingData.testLists.every(
          (item) =>
            typeof item.list_id === "string" &&
            typeof item.isIncorrect === "boolean"
        )
      ) {
        console.log("testLists 검증 실패");
        return false;
      }

      // 3. testMode 검사
      if (
        testingData.testMode !== "wordToMean" &&
        testingData.testMode !== "meanToWord"
      ) {
        console.log("testMode 검증 실패");
        return false;
      }

      // 4. data에 필수 프로퍼티가 있고 값이 있어야 함
      const {
        nowIndex,
        listsData,
        wordsData,
        optionData,
        correctOptionData,
        chosenOptionData,
      } = testingData.data;
      if (
        typeof nowIndex !== "number" ||
        !Array.isArray(listsData) ||
        !Array.isArray(wordsData) ||
        !Array.isArray(optionData) ||
        !Array.isArray(correctOptionData) ||
        !Array.isArray(chosenOptionData) ||
        listsData.length === 0 ||
        wordsData.length === 0 ||
        optionData.length === 0 ||
        correctOptionData.length === 0 ||
        chosenOptionData.length === 0
      ) {
        console.log("data 필수 프로퍼티 검증 실패");
        return false;
      }

      // 5. wordsData, correctOptionData, chosenOptionData의 길이가 같아야 함
      if (
        wordsData.length !== correctOptionData.length ||
        wordsData.length !== chosenOptionData.length ||
        correctOptionData.length !== chosenOptionData.length
      ) {
        console.log(
          "wordsData, correctOptionData, chosenOptionData 길이 검증 실패"
        );
        return false;
      }

      // 6. listsData, wordsData 형식 체크
      if (!listsData.every(staticData.checkFormFuncs.checkListForm)) {
        console.log("listsData 형식 검증 실패");
        return false;
      }

      if (!wordsData.every(staticData.checkFormFuncs.checkWordForm)) {
        console.log("wordsData 형식 검증 실패");
        return false;
      }

      // 7. nowIndex 체크
      if (nowIndex < 0 || nowIndex >= wordsData.length) {
        console.log("nowIndex 검증 실패");
        return false;
      }

      // 8. optionData 체크
      if (
        !optionData.every(
          (arr) =>
            Array.isArray(arr) && arr.every((item) => typeof item === "string")
        )
      ) {
        console.log("optionData 검증 실패");
        return false;
      }

      // 9. correctOptionData는 모두 string이어야 함
      if (!correctOptionData.every((item) => typeof item === "string")) {
        console.log("correctOptionData 검증 실패");
        return false;
      }

      // 10. chosenOptionData는 null 또는 string이어야 함
      if (
        !chosenOptionData.every(
          (item) => item === null || typeof item === "string"
        )
      ) {
        console.log("chosenOptionData 검증 실패");
        return false;
      }

      return true;
    },
    checkTestResultForm: (testResult: TestResult): boolean => {
      // 1. test_id는 유닉스 타임 형식의 숫자여야 함
      if (
        isNaN(Number(testResult.test_id)) ||
        String(Number(testResult.test_id)) !== testResult.test_id
      ) {
        console.log("test_id 검증 실패");
        return false;
      }

      // 2. testList 프로퍼티 검증
      if (!Array.isArray(testResult.testList)) {
        console.log("testList 검증 실패");
        return false;
      }
      if (
        !testResult.testList.every(
          (list) =>
            typeof list.list_id === "string" &&
            typeof list.isIncorrect === "boolean" &&
            typeof list.name === "string"
        )
      ) {
        console.log("testList 요소 검증 실패");
        return false;
      }

      // 3. testMode는 'wordToMean' 또는 'meanToWord'여야 함
      if (!["wordToMean", "meanToWord"].includes(testResult.testMode)) {
        console.log("testMode 검증 실패");
        return false;
      }

      // 4. wrongQuestions는 배열이어야 함
      if (!Array.isArray(testResult.wrongQuestions)) {
        console.log("wrongQuestions 검증 실패");
        return false;
      }

      // 5. wrongQuestions 요소가 있을 때 필수 프로퍼티 검증
      if (testResult.wrongQuestions.length > 0) {
        for (const question of testResult.wrongQuestions) {
          if (
            typeof question.word !== "string" ||
            typeof question.mean !== "string" ||
            typeof question.chosenOption !== "string" ||
            typeof question.listName !== "string"
          ) {
            console.log("wrongQuestions 요소 검증 실패");
            return false;
          }

          // 6. listName은 testList의 name이어야 함
          const validListNames = testResult.testList.map((list) => list.name);
          if (!validListNames.includes(question.listName)) {
            console.log("listName 검증 실패");
            return false;
          }

          // 7. wordData는 Word 타입이어야 함
          const wordData = question.wordData;
          if (!staticData.checkFormFuncs.checkWordForm(wordData)) {
            console.log("wordData 검증 실패");
            return false;
          }
        }
      }

      // 모든 검증을 통과하면 true 반환
      return true;
    },
  },

  Queue: class<T> {
    private head: Node<T> | null = null;
    private tail: Node<T> | null = null;
    private length: number = 0;
    private maxSize: number;
    private triggerAction: (items: T[]) => Promise<void>;

    constructor(triggerAction: (items: T[]) => Promise<void>, maxSize = 7) {
      this.maxSize = maxSize;
      this.triggerAction = triggerAction;
    }
    enqueue(value: T): void {
      if (this.length >= this.maxSize * 2) {
        console.warn(
          `Queue has reached its maximum size of ${
            this.maxSize * 2
          }. No more items can be added.`
        );
        return;
      }

      const existingItems = this.getQueue();

      if (typeof value === "object" && value !== null && "_id" in value) {
        const existingItem = existingItems.find(
          (item: any) => item._id === (value as any)._id
        );

        if (existingItem) {
          const updatedQueue = existingItems.filter(
            (item: any) => item._id !== (value as any)._id
          );

          this.head = null;
          this.tail = null;
          this.length = 0;

          for (const item of updatedQueue) {
            const newNode = new Node(item);
            if (this.tail) {
              this.tail.next = newNode;
            } else {
              this.head = newNode;
            }
            this.tail = newNode;
            this.length++;
          }

          console.log(
            `Duplicate _id found. Removed the existing item and restructured the queue. Current size: ${this.length}`
          );
        }
      }

      const newNode = new Node(value);
      if (this.tail) {
        this.tail.next = newNode;
      }
      this.tail = newNode;

      if (!this.head) {
        this.head = newNode;
      }

      this.length++;
      console.log(`Data is added in queue. Current size: ${this.length}`);
      // if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      //   this._trigger();
      //   console.log("sibal iphone");
      // }
      if (this.length >= this.maxSize) {
        console.log("The queue is full. Triggering the process now.");
        this._trigger();
      }
    }

    dequeue(): T | null {
      if (!this.head) {
        return null;
      }

      const removedValue = this.head.value;
      this.head = this.head.next;

      if (!this.head) {
        this.tail = null;
      }

      this.length--;
      return removedValue;
    }

    getQueue(): T[] {
      const items: T[] = [];
      let current = this.head;

      while (current) {
        items.push(current.value);
        current = current.next;
      }

      return items;
    }

    async forceTrigger(): Promise<void> {
      await this._trigger();
    }

    private async _trigger(): Promise<void> {
      const itemsToProcess: T[] = [];

      for (let i = 0; i < this.maxSize; i++) {
        const item = this.dequeue();
        if (item) {
          itemsToProcess.push(item);
        }
      }

      console.log("invoke trigger ", itemsToProcess);
      await this.triggerAction(itemsToProcess);
    }

    size(): number {
      return this.length;
    }

    isEmpty(): boolean {
      return this.length === 0;
    }
  },
};
