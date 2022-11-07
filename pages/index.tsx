import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import Head from "next/head";
import { useRef, useState } from "react";
import { v4 as uuid4 } from "uuid";
import {
  PromptStoreProvider,
  usePrompts,
  usePromptWriter,
} from "../library/context/PromptStoreContext";
import styles from "../styles/Home.module.css";

const DEFAULT_LIST = "Default List";

function Home() {
  const prompts = usePrompts();
  const [list, setList] = useState(DEFAULT_LIST);
  const [showNewListPrompt, setShowNewListPrompt] = useState(false);
  const allListsSet = new Set(
    prompts.map((prompt) => {
      return prompt.list;
    })
  );

  allListsSet.add(list);

  const allLists = Array.from(allListsSet);

  const writer = usePromptWriter();

  const promptsForList = prompts.filter((prompt) => prompt.list === list);

  const newListInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.container}>
      <Head>
        <title>Pengineer</title>
        <meta name="description" content="Create training data for OpenAI" />
      </Head>

      <header>
        <h2>Pengineer</h2>
      </header>

      <main className={styles.main}>
        <div className={styles.leftPane}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formElement = e.target as HTMLFormElement;
              const formData = new FormData(formElement);

              const uuid = uuid4();
              const prompt = formData.get("prompt")?.toString();
              const completion = formData.get("completion")?.toString();

              if (!prompt || !completion) {
                return;
              }

              writer.save({
                uuid,
                list,
                prompt,
                completion,
              });
              formElement.reset();
            }}
          >
            <div className={styles.editables}>
              <div className={styles.editableContainer}>
                <label htmlFor="prompt">Prompt</label>
                <textarea
                  placeholder="What is the capital of Italy?"
                  name="prompt"
                />
              </div>

              <div className={styles.editableContainer}>
                <label htmlFor="completion">Completion</label>
                <textarea placeholder="Rome" name="completion" />
              </div>
            </div>
            <div>
              <input type="submit" value={`Add to "${list}"`} />
            </div>
          </form>
        </div>

        <div className={styles.rightPane}>
          <div className={styles.selectContainer}>
            <select className={styles.select} onChange={(e) => {}}>
              {allLists.map((list) => {
                return (
                  <option key={list} value={list}>
                    {list}
                  </option>
                );
              })}
            </select>

            <div className={styles.newListContainer}>
              <div
                className={styles.plus}
                onClick={() => {
                  const newState = !showNewListPrompt;
                  setShowNewListPrompt(newState);
                  if (newState && newListInputRef.current) {
                    newListInputRef.current.focus();
                  }
                }}
              >
                <PlusIcon />
              </div>

              <input
                ref={newListInputRef}
                placeholder="Extra fine-tuned list"
                className={[styles.newListInput]
                  .concat(showNewListPrompt ? styles.visibilityHidden : [])
                  .join(" ")}
              />
            </div>
          </div>

          <div>
            {promptsForList.map(({ prompt, uuid }) => {
              return <Prompt key={uuid} uuid={uuid} prompt={prompt} />;
            })}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>Built by Vivek</footer>
    </div>
  );
}

function Prompt({ prompt, uuid }: { prompt: string; uuid: string }) {
  const writer = usePromptWriter();
  return (
    <div className={styles.prompt}>
      <div>{prompt}</div>
      <div>
        <div
          className={styles.crossMark}
          onClick={() => {
            writer.delete(uuid);
          }}
        >
          <Cross2Icon />
        </div>
      </div>
    </div>
  );
}

export default function HomeWrapper() {
  return (
    <PromptStoreProvider>
      <Home />
    </PromptStoreProvider>
  );
}
