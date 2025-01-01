// type
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
  },
  endpoint: process.env.REACT_APP_API_GATEWAY_ENDPOINT as string,
  updateListInArray: (lists: Array<any>, updatedList: any) => {
    return lists.map((list) =>
      list._id === updatedList._id ? updatedList : list
    );
  },
  updatedWordsArray: (words: Array<any>, updatedWord: any) => {
    return words.map((word) =>
      word._id === updatedWord._id ? updatedWord : word
    );
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
