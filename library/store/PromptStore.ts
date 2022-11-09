export type PromptData = {
  uuid: string;
  list: string;
  prompt: string;
  completion: string;
};

export type ListData = {
  name: string;
};

type IDBEventTarget = EventTarget & {
  error: {
    message: string;
  };
};

const INDEXED_DB_VERSION = 1;
const INDEXED_DB_NAME = "PROMPTS_DB";
const INDEXED_DB_PROMPTS_STORE = "PROMPTS_OBJECT_STORE";
const INDEXED_DB_LISTS_STORE = "LISTS_OBJECT_STORE";
export const DEFAULT_LIST = "Default List";

type IDBInformation = { instance?: IDBDatabase; objectStore?: IDBObjectStore };

class PromptStore {
  private subscriptions = new Map<string, { callback: () => void }>();
  private prompts: PromptData[] = [];
  private lists: ListData[] = [];
  private dbInformation: IDBInformation | null = null;

  addSubscription(callback: () => void) {
    const subscriptionId = `${Math.random()}`;
    this.subscriptions.set(subscriptionId, { callback });
  }

  private notifySubscribers() {
    const values = Array.from(this.subscriptions.values());
    for (const { callback } of values) {
      callback();
    }
  }

  private getIDBInformation() {
    if (this.dbInformation) {
      return this.dbInformation;
    }

    const info: IDBInformation = {};

    return new Promise<IDBInformation>((resolve, reject) => {
      const dbRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

      dbRequest.addEventListener("upgradeneeded", () => {
        const dbInstance = dbRequest.result;

        let promptObjectStore: IDBObjectStore | null = null;

        if (!dbInstance.objectStoreNames.contains(INDEXED_DB_PROMPTS_STORE)) {
          promptObjectStore = dbInstance.createObjectStore(
            INDEXED_DB_PROMPTS_STORE,
            {
              keyPath: "uuid",
            }
          );

          promptObjectStore.createIndex("uuid", "uuid", { unique: false });
        }

        let listObjectStore: IDBObjectStore | null = null;

        if (!dbInstance.objectStoreNames.contains(INDEXED_DB_LISTS_STORE)) {
          listObjectStore = dbInstance.createObjectStore(
            INDEXED_DB_LISTS_STORE,
            {
              keyPath: "name",
            }
          );

          listObjectStore.createIndex("name", "name", { unique: false });
        }
      });

      dbRequest.addEventListener("success", () => {
        const dbInstance = dbRequest.result;

        info.instance = dbInstance;

        info.objectStore = dbInstance
          .transaction(INDEXED_DB_PROMPTS_STORE)
          .objectStore(INDEXED_DB_PROMPTS_STORE);

        this.dbInformation = info;

        resolve(info);
      });

      dbRequest.addEventListener("error", () => {
        reject(new Error("IDB: error creating the database instance"));
      });
    });
  }

  async run() {
    const { instance } = await this.getIDBInformation();
    if (!instance) {
      throw new Error("IDB for prompts have not been setup yet");
    }

    try {
      await this.saveList({ name: DEFAULT_LIST });
    } catch (e) {
      // Ignore, probably exists already
    }

    // Preload prompts
    const promptStore = instance
      .transaction(INDEXED_DB_PROMPTS_STORE)
      .objectStore(INDEXED_DB_PROMPTS_STORE);

    const getPromptsRequest: IDBRequest<PromptData[]> = promptStore.getAll();

    await new Promise<Error | null>((resolve, reject) => {
      getPromptsRequest.addEventListener("success", async () => {
        this.prompts = getPromptsRequest.result;
        resolve(null);
      });

      getPromptsRequest.addEventListener("error", () => {
        reject(new Error("IDB: error in retrieving prompts"));
      });
    });

    // Preload lists
    const listStore = instance
      .transaction(INDEXED_DB_LISTS_STORE)
      .objectStore(INDEXED_DB_LISTS_STORE);

    const getListsRequest: IDBRequest<ListData[]> = listStore.getAll();

    await new Promise<Error | null>((resolve, reject) => {
      getListsRequest.addEventListener("success", async () => {
        this.lists = getListsRequest.result;
        resolve(null);
      });

      getListsRequest.addEventListener("error", () => {
        reject(new Error("IDB: error in retrieving prompts"));
      });
    });
  }

  /*
   * Read, update and delete prompts
   */
  getPrompts() {
    return this.prompts;
  }

  async savePrompt(promptData: PromptData) {
    const { instance } = await this.getIDBInformation();
    if (!instance) {
      return;
    }

    return await new Promise<string | null>((resolve) => {
      const objectStore = instance
        .transaction(INDEXED_DB_PROMPTS_STORE, "readwrite")
        .objectStore(INDEXED_DB_PROMPTS_STORE);

      const addRequest = objectStore.add(promptData);

      addRequest.addEventListener("success", () => {
        this.prompts.push(promptData);
        this.notifySubscribers();
        resolve(null);
      });

      addRequest.addEventListener("error", (e) => {
        const idbEventTarget = e.target as IDBEventTarget | null;
        let addRequestFailed = "Add request faield";
        if (idbEventTarget?.error?.message) {
          if (idbEventTarget.error.message.includes("already exists")) {
            addRequestFailed = "Effect with that name already exists";
          }
        }
        resolve(addRequestFailed);
      });
    });
  }

  async deletePrompt(uuid: string) {
    const { instance } = await this.getIDBInformation();
    if (!instance) {
      return new Error("IDB for prompts have not been setup yet");
    }

    const objectStore = instance
      .transaction(INDEXED_DB_PROMPTS_STORE, "readwrite")
      .objectStore(INDEXED_DB_PROMPTS_STORE);

    return new Promise<Error | null>((resolve) => {
      const deleteRequest = objectStore.delete(uuid);

      deleteRequest.addEventListener("success", async () => {
        this.prompts = this.prompts.filter((s) => s.uuid !== uuid);
        this.notifySubscribers();
        resolve(null);
      });

      deleteRequest.addEventListener("error", () => {
        resolve(new Error("IDB: error in retrieving prompts"));
      });
    });
  }

  /*
   * Read, update, and delete lists
   */

  getLists() {
    return this.lists;
  }

  async saveList(listData: ListData) {
    const { instance } = await this.getIDBInformation();
    if (!instance) {
      return;
    }

    return await new Promise<string | null>((resolve) => {
      const objectStore = instance
        .transaction(INDEXED_DB_LISTS_STORE, "readwrite")
        .objectStore(INDEXED_DB_LISTS_STORE);

      const addRequest = objectStore.add(listData);

      addRequest.addEventListener("success", () => {
        this.lists.push(listData);
        this.notifySubscribers();
        resolve(null);
      });

      addRequest.addEventListener("error", (e) => {
        const idbEventTarget = e.target as IDBEventTarget | null;
        let addRequestFailed = "Add request faield";
        if (idbEventTarget?.error?.message) {
          if (idbEventTarget.error.message.includes("already exists")) {
            addRequestFailed = "Effect with that name already exists";
          }
        }
        resolve(addRequestFailed);
      });
    });
  }

  async deleteList(name: string) {
    const { instance } = await this.getIDBInformation();
    if (!instance) {
      return new Error("IDB for lists have not been setup yet");
    }

    const objectStore = instance
      .transaction(INDEXED_DB_LISTS_STORE, "readwrite")
      .objectStore(INDEXED_DB_LISTS_STORE);

    return new Promise<Error | null>((resolve) => {
      const deleteRequest = objectStore.delete(name);

      deleteRequest.addEventListener("success", async () => {
        this.lists = this.lists.filter((s) => s.name !== name);
        this.notifySubscribers();
        resolve(null);
      });

      deleteRequest.addEventListener("error", () => {
        resolve(new Error("IDB: error in retrieving lists"));
      });
    });
  }
}

export default PromptStore;
