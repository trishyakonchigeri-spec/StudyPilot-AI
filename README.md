# StudyPilot AI 📚

**An AI-powered student productivity and learning platform built with Next.js, TypeScript, Prisma, and MySQL.**

StudyPilot AI brings study planning, PDF-based learning, quiz practice, and academic progress tracking together in one application.

## ✨ Features

- **Student Dashboard** — View study activity, uploaded documents, and quiz performance.
- **PDF Upload** — Upload study materials and extract their text.
- **Document Chat** — Ask questions about uploaded study documents.
- **Quiz Generation** — Create quizzes to practice and test your understanding.
- **Quiz Results & Progress** — Track scores and review past quiz attempts.
- **Study Planner** — Organize study sessions and academic tasks.
- **Authentication** — Access protected features and user-specific information.

## ## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js** | Full-stack web framework for application pages, routing, and backend API endpoints |
| **React** | Building interactive and reusable user interface components |
| **TypeScript** | Type-safe development for improved code reliability and maintainability |
| **Tailwind CSS** | Creating responsive, modern, and consistent user interfaces |
| **Prisma ORM** | Managing database access and executing type-safe database queries |
| **MySQL** | Storing user accounts, documents, quiz results, and study progress |
| **Ollama** | Running large language models locally to power AI-based features |
| **Node.js** | JavaScript runtime for server-side application execution |
| **npm** | Managing project dependencies and running development scripts |
## 🤖 Local AI with Ollama

StudyPilot AI uses **Ollama** to run large language models locally for AI-powered learning features, such as document-based chat and quiz generation.

**Setup:**

1. Install [Ollama](https://ollama.com/download).
2. Download the Llama 3.2 model:

   ```bash
   ollama pull llama3.2
   ```

3. Start the model:

   ```bash
   ollama run llama3.2
   ```

4. Ensure Ollama is running and configured in your application before using AI-powered features.

**Note:** The model runs locally on your machine, so AI inference does not require a paid cloud AI API. Initial model downloads require an internet connection.
## 🏗️ Project Architecture

```text
StudyPilot AI
│
├── Frontend (Next.js + React + TypeScript)
│   ├── Student Dashboard
│   ├── PDF Upload & Text Extraction
│   ├── AI Chat with Documents
│   ├── Quiz Generation & Results
│   └── Study Planner & Progress Tracking
│
├── Backend (Next.js API Routes)
│   ├── Authentication & User Management
│   ├── Document Processing
│   ├── Chat & Quiz APIs
│   └── Study Planner APIs
│
└── Data Layer
    ├── Prisma ORM
    └── MySQL Database

```

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- MySQL Server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/studypilot-ai.git
cd studypilot-ai
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure the variables required by your local setup.

Example:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@127.0.0.1:3306/studypilot"
DB_PASSWORD="YOUR_PASSWORD"
```

Replace `YOUR_PASSWORD` with your local MySQL password. Never commit your `.env` file or expose credentials.

### 4. Set up the database

Create the database if it does not already exist:

```sql
CREATE DATABASE studypilot;
```

Generate the Prisma client:

```bash
npx prisma generate
```

For a fresh database, apply the project's verified migrations:

```bash
npx prisma migrate deploy
```

**Note:** Verify the migration history before using these instructions on a fresh installation. Never reset or drop a database containing data you want to preserve.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Security

- Keep `.env` and `.env.local` out of Git.
- Never commit credentials, database backups, or private student documents.
- Ensure API routes enforce authentication and user-specific access controls.

## 🎯 Project Objective

The goal of StudyPilot AI is to make student learning more organized and interactive by combining study planning, document-based learning, quizzes, and progress tracking.

## 👩‍💻 Author

Developed as a student project to explore full-stack web development and AI-assisted learning.

---

**Study smarter. Stay organized. Learn continuously.** 🚀
