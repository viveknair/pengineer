import {
  CheckIcon,
  Cross2Icon,
  DownloadIcon,
  Pencil1Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { motion, useInView } from "framer-motion";
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
import { download } from "../library/utils";
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

  const promptTextAreaRef = useRef<HTMLTextAreaElement>(null);

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

              if (promptTextAreaRef.current) {
                promptTextAreaRef.current.focus();
              }
            }}
          >
            <div className={styles.editables}>
              <div className={styles.editableContainer}>
                <label htmlFor="prompt">Prompt</label>
                <textarea
                  ref={promptTextAreaRef}
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
              <div
                tabIndex={0}
                className={[styles.iconWrapper, styles.download].join(" ")}
                onClick={() => {
                  if (promptsForList.length === 0) {
                    return;
                  }
                  const jsonValues = promptsForList.map((prompt) => {
                    return JSON.stringify(prompt);
                  });
                  const jsonlValue = jsonValues.join("\n");
                  download(`dataset-${Date.now()}.jsonl`, jsonlValue);
                }}
              >
                <DownloadIcon />
              </div>

              <div
                tabIndex={0}
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
              tabIndex={0}
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
            {promptsForList.length > 0 ? (
              promptsForList.map(({ prompt, uuid, completion }) => {
                return (
                  <Prompt
                    key={uuid}
                    uuid={uuid}
                    prompt={prompt}
                    completion={completion}
                  />
                );
              })
            ) : (
              <div className={styles.noPromptYet}>No prompts yet</div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const Footer = () => {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, {
    once: true,
  });
  return (
    <footer ref={ref} className={styles.footer} data-animate={isInView}>
      <div className={styles.footerText}>
        Built by <a href="https://twitter.com/virtuallyvivek">✨ Vivek ✨</a>
      </div>
      <VivekSignature />
    </footer>
  );
};

const VivekSignature = () => {
  return (
    <motion.svg
      className={styles.vivekSignature}
      viewBox="0 0 381 271"
      fill="none"
      initial={{ opacity: 1 }}
      whileInView={{ opacity: 0 }}
      transition={{ delay: 2.5 }}
      viewport={{ once: true }}
    >
      <path
        d="M13.6882 148.826C19.2224 142.835 27.1481 138.043 34.5875 133.872C56.83 121.399 81.4081 112.473 106.895 105.717C107.273 105.617 127.32 100.161 127.847 102.362C128.067 103.28 125.927 105.054 125.484 105.498C118.073 112.909 110.554 120.253 103.114 127.644C86.6734 143.977 69.9994 160.139 53.2289 176.236C39.7867 189.138 25.8858 201.815 13.2156 215.266C11.1225 217.489 9.1347 219.779 7.1768 222.086C7.13872 222.131 2.18619 227.686 2.00448 229.432C1.85308 230.886 5.57945 229.171 7.12429 228.489C14.5653 225.202 22.0951 220.885 28.9426 217.065C93.892 180.823 157.43 142.654 215.619 99.029C257.155 67.8889 295.624 34.1399 336 2"
        stroke="black"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
      />
      <path
        d="M88 231C88.3189 229.725 90.4728 229.65 91.5 229.222C98.7675 226.194 105.979 223.162 113.333 220.333C140.691 209.811 167.343 197.275 194 185.111C198.779 182.931 194.835 185.343 193 186.944C185.791 193.233 178.244 199.016 170.444 204.556C164.781 208.578 158.392 212.319 153.889 217.722C150.752 221.487 158.982 220.309 161.167 220.556C166.249 221.129 172.31 221.464 176.889 224C179.299 225.335 179.974 228.259 182.611 229.333C186.67 230.987 196.23 230.169 198.778 226C199.623 224.617 200.934 224.762 202.5 224.278C208.853 222.311 214.892 219.542 221.444 218.222C228.061 216.89 247.934 216.91 241.444 215.056C236.846 213.742 228.541 214.205 227.167 220.389C226.927 221.468 257.245 222.889 259.667 222.889C281.896 222.889 298.719 216.168 314.222 200.111C326.274 187.628 337.232 174.103 349.167 161.5C357.202 153.015 365.887 143.723 376.667 138.667C377.526 138.263 380.117 137.079 378.667 139.556C374.228 147.135 366.899 154.021 361 160.333C343.713 178.831 325.441 196.402 304.444 210.667C63.0849 374.644 415.411 135.116 294.944 216.722C292.91 218.1 299.73 215.604 302.111 215C315.503 211.603 329.368 208.405 343.167 207.333C345.918 207.12 349.226 206.29 350 209C351.333 213.667 362.397 216.337 366 218"
        stroke="black"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
      />
    </motion.svg>
  );
};

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
          tabIndex={0}
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
          tabIndex={0}
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
