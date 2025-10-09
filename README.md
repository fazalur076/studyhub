# StudyHub: AI-Powered Study Companion

StudyHub is a responsive web application designed to help students and learners revise their study materials using AI. It enables users to upload and manage PDFs (e.g., textbooks, study guides, reference materials), view PDFs, generate quizzes (MCQs, SAQs, LAQs), chat with an AI tutor with Retrieval-Augmented Generation (RAG) citations, and track learning progress. This project was developed as an assignment for BeyondChats, showcasing a balance of functionality, UI/UX, and rapid development using Large Language Models (LLMs).

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Development Journey](#development-journey)
- [LLM Usage](#llm-usage)
- [What's Done vs. Missing](#whats-done-vs-missing)
- [Setup and Local Run](#setup-and-local-run)
- [Live Demo](#live-demo)

## Features

### Must-Have Features (Fully Implemented)
1. **Source Selector**:
   - Component to select all uploaded PDFs or specific ones (`SourceSelector.tsx`).
   - Supports manual seeding with NCERT Class XI Physics PDFs (marked with `isSeeded` flag).
   - Allows users to upload their own PDF coursebooks via drag-and-drop or browse (`PDFUpload.tsx`).
2. **PDF Viewer**:
   - Displays selected PDFs in a split view (desktop) or overlay (mobile) alongside chat (`PDFViewer.tsx`).
   - Features zoom, page navigation, fullscreen, and page number input.
3. **Quiz Generator Engine**:
   - Generates Multiple Choice Questions (MCQs), Short Answer Questions (SAQs), Long Answer Questions (LAQs), and mixed quizzes from selected PDFs using LLMs (`QuizPage.tsx`, `openai.service.ts`).
   - Renders quizzes with answer capture, scoring, and detailed explanations (`QuizInterface.tsx`, `QuizQuestion.tsx`, `QuizResults.tsx`).
   - Stores quiz attempts in Supabase (`quiz_attempts` table) and allows generating new question sets.
4. **Progress Tracking**:
   - Tracks user performance, including total quizzes, average scores, strengths/weaknesses, and topic-specific scores (`ProfilePage.tsx`, `calculateUserProgress`).
   - Displays a dashboard with charts, recent attempts, and reviewable quizzes.

### Nice-to-Have Features
1. **Chat UI (Fully Implemented)**:
   - ChatGPT-inspired interface with a sidebar for chat history, main chat window, and bottom input box (`ChatPage.tsx`, `ChatSidebar.tsx`, `ChatInterface.tsx`).
   - Supports creating new chats, switching between chats, and mobile-responsive design (e.g., bottom nav, overlays).
2. **RAG Answers with Citations (Fully Implemented)**:
   - Ingests selected PDFs, chunks text, and embeds semantically (`pdf.service.ts`).
   - Chatbot provides answers with page numbers and 2–3 line snippets from the source (`ChatMessage.tsx`).
   - Smart topic detection for contextual video recommendations based on the content being discussed.
3. **YouTube Videos Recommender (Fully Implemented)**:
   - Integrated video recommendation button in chat responses (`VideoRecommendationButton.tsx`).
   - Shows relevant educational videos from channels like Khan Academy, CrashCourse, 3Blue1Brown.
   - Appears automatically for assistant responses with explanations or citations.
   - **Dynamic topic detection** - works for any subject matter (chemistry, physics, biology, mathematics, etc.).
   - Generates contextual video suggestions based on intelligently extracted topics from the conversation.

## Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router, React PDF.
- **Backend/Database**: Supabase (Auth, PostgreSQL, Storage) with Row-Level Security (RLS).
- **AI**: Grok/OpenAI for quiz generation and RAG-based chat responses.
- **Other**: UUID for unique IDs, Sonner for toast notifications.

## Development Journey

### Real-World Validation
What started as a BeyondChats assignment quickly evolved into a tool that resonated with real users. Over **10+ friends and peers** are now actively using StudyHub for their exam preparations—ranging from competitive exams to university coursework—and have provided overwhelmingly positive feedback. This organic adoption validated the product-market fit and motivated continuous refinements based on user suggestions.

## Future Roadmap & Vision

### Planned Enhancements
1. **Custom LLM Training**:
   - Build and fine-tune a Llama-based model specifically optimized for educational Q&A, quiz generation, and study assistance.
   - Train on curated educational datasets to improve accuracy, consistency, and subject-specific understanding.
   - Reduce dependency on external APIs for better control, cost efficiency, and offline capabilities.

2. **Full-Stack Ownership**:
   - Transition from external AI APIs to self-hosted inference infrastructure.
   - Implement custom RAG pipelines with domain-specific embeddings for improved citation accuracy.
   - Build proprietary quiz generation algorithms tailored to different learning styles and difficulty curves.

3. **Enhanced User Experience**:
   - Adaptive learning paths that adjust based on quiz performance and progress patterns.
   - Collaborative study features (shared quizzes, study groups, peer challenges).
   - Expanded content support (lecture videos, handwritten notes OCR, audio transcriptions).

4. **Production Readiness**:
   - Public hosting with scalable infrastructure.
   - Mobile app versions (React Native or Flutter).
   - Advanced analytics dashboard for educators and institutions.

### Open-Source Commitment
**StudyHub will remain 100% open-source.** The vision is to democratize AI-powered learning by building a fully transparent, community-driven platform where:
- Students and educators can self-host their own instances with complete data privacy.
- Developers can contribute features, language support, and educational content integrations.
- The custom-trained Llama model and training pipeline will be publicly available for research and adaptation.
- No vendor lock-in, no hidden algorithms—just open education technology accessible to everyone.

### Long-Term Goal
Transform StudyHub from an MVP into a **fully independent, production-grade learning platform** with 100% custom-built AI capabilities—no external dependencies, complete control over the learning experience, and a model specifically trained to understand how students learn best. All while keeping it open, transparent, and free for the global learning community.

---
## LLM Usage
LLMs (Grok, Claude, GPT) were used extensively to accelerate development (~60% of code):
- **Code Generation**: Generated component skeletons (e.g., `ChatInterface.tsx`, `QuizQuestion.tsx`), service functions (e.g., `generateQuiz`, `chunkText`).
- **Prompt Engineering**: Crafted prompts for quiz generation (MCQ/SAQ/LAQ) and RAG chat with citations.
- **Debugging**: Fixed Supabase RLS issues, React hooks, and PDF extraction errors.
- **Optimization**: Refined state management, hook usage, and Tailwind styles.
- All LLM-generated code was manually reviewed and customized for type safety, performance, and consistency.

## What's Done vs. Missing
- **Done**:
  - All must-have features: Source selector, PDF viewer, quiz engine, progress tracking.
  - All nice-to-haves: Chat UI, RAG with citations, YouTube video recommendations.
  - Responsive design, clean UI/UX, robust error handling (toasts, loading states).
  - **Validated by 10+ active users** who rely on StudyHub for competitive exam prep, university studies, and professional certifications.
- **Missing/Partial**:
  - **Automated Content Seeding**: Currently supports manual PDF uploads to ensure each user builds their personalized study library. This design choice was intentional—allowing learners to curate content relevant to their specific goals (JEE, NEET, university exams, professional certifications) rather than limiting them to pre-loaded textbooks. Future versions may include optional template libraries for popular exams while preserving this flexibility.

## Setup and Local Run
### Prerequisites
- Node.js 18+ (https://nodejs.org).
- Supabase account (https://supabase.com).
- OpenAI or Grok API key for quiz generation and chat (https://platform.openai.com or https://x.ai/api).
- (Optional) Study material PDFs for testing (textbooks, NCERT books, or any educational content).

### Steps
1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/studyhub.git
   cd studyhub
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Create Environment Variables**:
   Create a `.env` file in the project root with:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # LLM provider (OpenAI, Grok/xAI, or any OpenAI-compatible API)
   VITE_AI_API_KEY=your_ai_api_key
   VITE_AI_API_BASE_URL=https://api.openai.com/v1
   VITE_AI_MODEL=llama-3.3-70b-versatile
   ```

4. **Set Up Supabase**:
   - Create a new Supabase project and copy URL + anon key into `.env`.
   - Run SQL schema from `sql.txt` in Supabase SQL editor (creates tables and indexes).
   - Apply Row-Level Security policies from `rls.txt`.
   - Create a Storage bucket named `study-app-pdfs` and apply policies from `storage.txt`.

5. **Run the App Locally**:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173` (default Vite port).

6. **Login**:
   - Enable Email/Password in Supabase Auth.
   - Create a user via Supabase dashboard or add a simple signup.

### Optional: Add Your Study Materials
- Upload any PDF study materials (textbooks, notes, reference books) via Home → Upload.
- PDFs are processed for AI-powered quiz generation and RAG-based chat.
- Optionally flag important reference materials for quick access.


## Live Demo

- URL: https://stdhub.surge.sh/
- Test account:
  - email: student@studyhub.com
  - password: testcreds1234

**Home:**
<img width="2558" height="1263" alt="Screenshot 2025-10-08 at 6 30 47 PM" src="https://github.com/user-attachments/assets/5ee46ee3-e890-4ada-9013-063759f74735" />

**Quiz:**
<img width="2558" height="1263" alt="Screenshot 2025-10-08 at 6 32 03 PM" src="https://github.com/user-attachments/assets/4a872752-9fe9-4a3d-9cd9-6b074b8c06d5" />

**Chat:**
<img width="2558" height="1263" alt="Screenshot 2025-10-08 at 6 32 39 PM" src="https://github.com/user-attachments/assets/cc35b6bd-5cc2-4d76-b30d-b9d653d25721" />

**Profile:**
<img width="2558" height="1263" alt="Screenshot 2025-10-08 at 6 33 23 PM" src="https://github.com/user-attachments/assets/ce4d7cbd-1f5f-49e1-b5fe-fd2567f0311e" />


---

If you run into issues:
- Verify `.env` values (Supabase URL/key, AI key/base URL, model name)
- Ensure tables/RLS/storage policies from `sql.txt`, `rls.txt`, `storage.txt` are applied
- Check browser console/network logs for CORS/auth errors
