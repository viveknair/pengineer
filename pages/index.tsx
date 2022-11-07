import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
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
          <div className={styles.editables}>
            <div className={styles.editableContainer}>
              <label>Prompt</label>
              <textarea placeholder="What is the capital of Italy?" />
            </div>

            <div className={styles.editableContainer}>
              <label>Completion</label>
              <textarea placeholder="Rome" />
            </div>
          </div>

          <div>
            <button>Add to Group</button>
          </div>
        </div>

        <div className={styles.rightPane}>
          <div>Default List</div>

          <div></div>
        </div>
      </main>

      <footer className={styles.footer}>Built by Vivek</footer>
    </div>
  );
}
