import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PromptStore, { ListData, PromptData } from "../store/PromptStore";

export const PromptStoreContext = React.createContext<PromptStore | null>(null);

export const PromptStoreProvider: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [promptStore, setPromptStore] = useState<PromptStore | null>(null);

  useEffect(() => {
    const store = new PromptStore();
    store.run().then(() => {
      setPromptStore(store);
    });

    return () => {
      setPromptStore(null);
    };
  }, []);

  return (
    <PromptStoreContext.Provider value={promptStore}>
      {children}
    </PromptStoreContext.Provider>
  );
};

export const usePromptWriter = () => {
  const store = useContext(PromptStoreContext);

  const save = useCallback(
    (newPrompt: PromptData) => {
      if (!store) {
        return null;
      }

      return store.savePrompt(newPrompt);
    },
    [store]
  );

  const saveRef = useRef(save);
  saveRef.current = save;

  const deletePrompt = useCallback(
    (uuid: string) => {
      if (!store) {
        return;
      }

      return store.deletePrompt(uuid);
    },
    [store]
  );

  const deleteRef = useRef(deletePrompt);
  deleteRef.current = deletePrompt;

  return {
    save: saveRef.current,
    delete: deleteRef.current,
  };
};

export const usePrompts: () => PromptData[] = () => {
  const store = useContext(PromptStoreContext);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!store) {
      return;
    }

    store.addSubscription(() => {
      setTick((t) => t + 1);
    });
  }, [store]);

  return useMemo(() => {
    if (!store) {
      return [];
    }

    return store.getPrompts();
    // IMPORTANT TO INCLUDE tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, store]);
};

export const useListWriter = () => {
  const store = useContext(PromptStoreContext);

  const save = useCallback(
    (newList: ListData) => {
      if (!store) {
        return null;
      }

      return store.saveList(newList);
    },
    [store]
  );

  const saveRef = useRef(save);
  saveRef.current = save;

  const deleteList = useCallback(
    (name: string) => {
      if (!store) {
        return;
      }

      return store.deleteList(name);
    },
    [store]
  );

  const deleteRef = useRef(deleteList);
  deleteRef.current = deleteList;

  return {
    save: saveRef.current,
    delete: deleteRef.current,
  };
};

export const useLists: () => ListData[] = () => {
  const store = useContext(PromptStoreContext);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!store) {
      return;
    }

    store.addSubscription(() => {
      setTick((t) => t + 1);
    });
  }, [store]);

  return useMemo(() => {
    if (!store) {
      return [];
    }

    return store.getLists();
    // IMPORTANT TO INCLUDE tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, store]);
};
