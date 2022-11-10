### About
Pengineer (prompt engineer) is a small NextJS application to help create prompts for OpenAI.

### Usage
Add your prompt and its related completion to the textareas. The prompt/completion pair saves to the selected list. The application creates a default list upon application start. You can create additional lists to organize your prompts.

### Download format
This application creates a [JSON line](https://jsonlines.org/) formatted file that's compatible with OpenAI model fine-tuning. More information on that [here](https://beta.openai.com/docs/guides/fine-tuning/prepare-training-data).


### Installation

```
yarn install
```

### Development mode

```
yarn dev
```

### Security details

- All information is persisted to the browser's storage using [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).
- Prompts are not sent to any remote backend.
- To delete your information, open Chrome Developer Tools and follow steps in the below image.

![Image](public/delete-idb-database.png)

### Author
[Vivek Nair](https://twitter.com/virtuallyvivek) developed this application. Throw him a follow.