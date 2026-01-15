# ASK ELLIOTT-AI
Ask Elliott-AI: is a Retrieval-Augmented Generation (RAG) agent that answers questions specifically about Bryan Elliott (Senior Software Engineer), my skills, projects, and professional career, by retrieving relevant context from a Supabase vector database and using an OpenAI model to generate a response.

To learn more about "Elliott-AI" and learn exactly how I developed the full build: data pipeline, chunking, embeddings, vector storage, retrieval, and the streaming data API endpoint, you can read my blog article, [Building Elliott-AI: A RAG Agent That Knows My Career Better Than I Do!](https://blog.elliottprogrammer.com/building-elliott-ai-a-rag-agent-that-knows-my-career-better-than-i-do/)

The [blog post](https://blog.elliottprogrammer.com/building-elliott-ai-a-rag-agent-that-knows-my-career-better-than-i-do/) walks through the full build: The data pipeline, chunking, embeddings, vector storage, retrieval, and finally the API endpoint that streams responses into a simple HTML + vanilla JS chat UI.

## Live Demo

You can view a live demo of **Ask Elliott-AI** in action on my dev portfolio website at: [https://elliottprogrammer.com](https://elliottprogrammer.com)

<hr/>

![elliott-ai_ui-screen-capture](https://github.com/user-attachments/assets/5efd88f6-65ef-4acd-a3b9-6c536882c982)

## Getting Started

Below you will find everything needed to get this project up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following software installed on your machine:

*   [Git](git-scm.com) (latest version)
*   [Node.js](nodejs.org) (v18+)

Also you'll need user accounts and API keys for the following:

*   [Supabase](https://supabase.com)
*   [OpenAI](https://openai.com/api/)

### Installation

Follow these steps to get your development environment set up and running.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/elliottprogrammer/ask-elliott-ai.git
    cd ask-elliott-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a new file named `.env` in the root directory:
    ```bash
    touch .env
    ```
    Edit the `.env` file to include your local configuration and API keys:

    * `SUPABASE_URL="Your Supabase project URL"`
    * `SUPABASE_SECRET_API_KEY="Your Supabase API key"`
    * `OPENAI_API_KEY="Your OpenAI API key"`

4.  **Set up the Supabase database**:
    See my [blog article](https://blog.elliottprogrammer.com/building-elliott-ai-a-rag-agent-that-knows-my-career-better-than-i-do/#the-data-layer) for Supabase database and table specifics.

5.  **Chunk up the documents and insert the chunks and embeddings in the Supabase vector store:**
    (Or you can replce the existing doments (in `src/server/documents`) with your own markdown files.)

    Chunk and insert documents by running:

    ```bash
    node ./src/server/chunk-files.mjs
    ```

### Running the Project Locally

To start the local development server, run the following command:

```bash
npm run dev:server
```

Now in a seperate terminal window, run the frontend client:

```bash
npm run dev
```

Then open your browser to: [http://localhost:5173/](http://localhost:5173/)

Enjoy! 
