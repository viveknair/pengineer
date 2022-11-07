export type PromptData = {
  uuid: string;
  list: string;
  prompt: string;
  completion: string;
};

type IDBEventTarget = EventTarget & {
  error: {
    message: string;
  };
};

const INDEXED_DB_VERSION = 1;
const INDEXED_DB_NAME = "PROMPTS_DB";
const INDEXED_DB_OBJECT_STORE = "PROMPTS_OBJECT_STORE";

type IDBInformation = { instance?: IDBDatabase; objectStore?: IDBObjectStore };

class PromptStore {
  private subscriptions = new Map<string, { callback: () => void }>();
  private prompts: PromptData[] = [];
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

    console.log("no db information");

    const info: IDBInformation = {};

    return new Promise<IDBInformation>((resolve, reject) => {
      const dbRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

      dbRequest.addEventListener("upgradeneeded", () => {
        const dbInstance = dbRequest.result;

        let objectStore: IDBObjectStore | null = null;

        if (dbInstance.objectStoreNames.contains(INDEXED_DB_OBJECT_STORE)) {
          return;
        }

        objectStore = dbInstance.createObjectStore(INDEXED_DB_OBJECT_STORE, {
          keyPath: "uuid",
        });

        objectStore.createIndex("uuid", "uuid", { unique: false });
      });

      dbRequest.addEventListener("success", () => {
        const dbInstance = dbRequest.result;

        info.instance = dbInstance;

        info.objectStore = dbInstance
          .transaction(INDEXED_DB_OBJECT_STORE)
          .objectStore(INDEXED_DB_OBJECT_STORE);

        this.dbInformation = info;

        resolve(info);
      });

      dbRequest.addEventListener("error", () => {
        reject(new Error("IDB: error creating the database instance"));
      });
    });
  }

  async run(): Promise<Error | null> {
    const { instance } = await this.getIDBInformation();
    if (!instance) {
      throw new Error("IDB for prompts have not been setup yet");
    }

    const objectStore = instance
      .transaction(INDEXED_DB_OBJECT_STORE)
      .objectStore(INDEXED_DB_OBJECT_STORE);

    const getAllRequest: IDBRequest<PromptData[]> = objectStore.getAll();

    return new Promise<Error | null>((resolve, reject) => {
      getAllRequest.addEventListener("success", async () => {
        this.prompts = getAllRequest.result;
        resolve(null);
      });

      getAllRequest.addEventListener("error", () => {
        reject(new Error("IDB: error in retrieving prompts"));
      });
    });
  }

  getPrompts() {
    return this.prompts;
  }

  async savePrompt(promptData: PromptData) {
    const { instance } = await this.getIDBInformation();
    console.log("testing", instance);
    if (!instance) {
      return;
    }

    return await new Promise<string | null>((resolve) => {
      const objectStore = instance
        .transaction(INDEXED_DB_OBJECT_STORE, "readwrite")
        .objectStore(INDEXED_DB_OBJECT_STORE);

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
      .transaction(INDEXED_DB_OBJECT_STORE, "readwrite")
      .objectStore(INDEXED_DB_OBJECT_STORE);

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
}

export default PromptStore;
