import {
  CheckIcon,
  Cross2Icon,
  DownloadIcon,
  Pencil1Icon,
  Pencil2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid4 } from "uuid";
import {
  EditablesProvider,
  useEditablesContext,
  useEditablesDispatchContext,
} from "../library/context/EditablesContext";
import {
  PromptStoreProvider,
  useLists,
  useListWriter,
  usePrompts,
  usePromptWriter,
} from "../library/context/PromptStoreContext";
import { DEFAULT_LIST } from "../library/store/PromptStore";
import styles from "../styles/Home.module.css";

function Home() {
  const prompts = usePrompts();
  const [list, setList] = useState(DEFAULT_LIST);
  const [showNewListPrompt, setShowNewListPrompt] = useState(false);

  const allLists = useLists();

  const promptWriter = usePromptWriter();
  const listWriter = useListWriter();

  const promptsForList = prompts.filter((prompt) => prompt.list === list);
  const newListInputRef = useRef<HTMLInputElement>(null);

  const { prompt, completion } = useEditablesContext();
  const dispatch = useEditablesDispatchContext();

  const [newListName, setNewListName] = useState("");

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
              const uuid = uuid4();

              if (!prompt || !completion) {
                return;
              }

              promptWriter.save({
                uuid,
                list,
                prompt,
                completion,
              });

              dispatch({
                prompt: "",
                completion: "",
              });
            }}
          >
            <div className={styles.editables}>
              <div className={styles.editableContainer}>
                <label htmlFor="prompt">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    dispatch({
                      prompt: e.target.value,
                      completion,
                    });
                  }}
                  placeholder="What is the capital of Italy?"
                  name="prompt"
                />
              </div>

              <div className={styles.editableContainer}>
                <label htmlFor="completion">Completion</label>
                <textarea
                  value={completion}
                  onChange={(e) => {
                    dispatch({
                      prompt,
                      completion: e.target.value,
                    });
                  }}
                  placeholder="Rome"
                  name="completion"
                />
              </div>
            </div>
            <div>
              <input type="submit" value={`Add to "${list}"`} />
            </div>
          </form>
        </div>

        <div className={styles.rightPane}>
          <div className={styles.selectContainer}>
            <select
              value={list}
              className={styles.select}
              onChange={(e) => {
                setList(e.target.value);
              }}
            >
              {allLists.map(({ name }) => {
                return (
                  <option key={name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>

            <div className={styles.newListContainer}>
              <div className={[styles.iconWrapper, styles.download].join(" ")}>
                <DownloadIcon />
              </div>

              <div
                className={[styles.iconWrapper, styles.plus].join(" ")}
                onClick={() => {
                  const newState = !showNewListPrompt;
                  setShowNewListPrompt(newState);
                  if (newState && newListInputRef.current) {
                    // Hack, allows enough time to refocus
                    setTimeout(() => {
                      newListInputRef.current?.focus();
                    }, 0);
                  }
                }}
              >
                <PlusIcon />
              </div>
            </div>
          </div>

          <div
            className={[styles.inputFormWrapper]
              .concat(showNewListPrompt ? [] : styles.visibilityHidden)
              .join(" ")}
          >
            <input
              value={newListName}
              onChange={(e) => {
                setNewListName(e.target.value);
              }}
              ref={newListInputRef}
              placeholder="Extra fine-tuned list"
              className={styles.newListInput}
            />

            <div
              className={[styles.iconWrapper, styles.check].join(" ")}
              onClick={() => {
                if (!newListName) {
                  return;
                }

                listWriter
                  .save({
                    name: newListName,
                  })
                  ?.then(() => {
                    setNewListName("");
                    setList(newListName);
                  });
              }}
            >
              <CheckIcon />
            </div>
          </div>

          <div>
            {promptsForList.map(({ prompt, uuid, completion }) => {
              return (
                <Prompt
                  key={uuid}
                  uuid={uuid}
                  prompt={prompt}
                  completion={completion}
                />
              );
            })}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>Built by Vivek</footer>
    </div>
  );
}

function Prompt({
  prompt,
  uuid,
  completion,
}: {
  prompt: string;
  uuid: string;
  completion: string;
}) {
  const writer = usePromptWriter();
  const dispatch = useEditablesDispatchContext();

  return (
    <div className={styles.prompt}>
      <div>{prompt}</div>
      <div className={styles.promptInteractors}>
        <div
          className={[styles.iconWrapper, styles.pencil].join(" ")}
          onClick={() => {
            dispatch({
              prompt,
              completion,
            });

            writer.delete(uuid);
          }}
        >
          <Pencil1Icon />
        </div>

        <div
          className={[styles.iconWrapper, styles.crossMark].join(" ")}
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
  useEffect(() => {
    console.log(`
 _|                                          
 _|_|_|      _|_|    _|_|_|      _|_|_|      _|_|_|      _|_|      _|_|    _|  _|_|  
 _|    _|  _|_|_|_|  _|    _|  _|    _|  _|  _|    _|  _|_|_|_|  _|_|_|_|  _|_|      
 _|    _|  _|        _|    _|  _|    _|  _|  _|    _|  _|        _|        _|        
 _|_|_|      _|_|_|  _|    _|    _|_|_|  _|  _|    _|    _|_|_|    _|_|_|  _|        
 _|                                  _|                                              
 _|                              _|_|                                                

~ by Vivek Nair (http://twitter.com/virtuallyvivek)
    `);
  }, []);

  return (
    <EditablesProvider>
      <PromptStoreProvider>
        <Home />
      </PromptStoreProvider>
    </EditablesProvider>
  );
}
