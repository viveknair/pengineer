import React, { FC, useContext, useState } from "react";

type Editables = {
  prompt: string;
  completion: string;
};

export const EditablesContext = React.createContext<Editables>({
  prompt: "",
  completion: "",
});

export const EditablesDispatchContext = React.createContext<
  (newEditables: Editables) => void
>(() => {});

export const EditablesProvider: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [promptStore, setPromptStore] = useState<Editables>({
    prompt: "",
    completion: "",
  });

  return (
    <EditablesContext.Provider value={promptStore}>
      <EditablesDispatchContext.Provider
        value={(newEditables) => {
          setPromptStore(newEditables);
        }}
      >
        {children}
      </EditablesDispatchContext.Provider>
    </EditablesContext.Provider>
  );
};

export function useEditablesDispatchContext() {
  return useContext(EditablesDispatchContext);
}

export function useEditablesContext() {
  return useContext(EditablesContext);
}
