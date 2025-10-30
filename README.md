# StudyHub: AI-Powered Study Companion

An open-source, AI-powered learning platform to help students study smarter. Upload PDFs, generate quizzes, chat with an AI tutor, and track your progress—all for free.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> Real Impact: Currently used by 15+ students for competitive exams, university coursework, and professional certifications.

## Table of Contents
- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development Notes](#development-notes)
- [Contributing](#contributing)
- [License](#license)

## About

I built StudyHub over a weekend as a take-home assignment for a company interview. I didn't get the job, but something unexpected happened—over 10 friends and classmates started using it for their exams. From JEE and NEET prep to university finals and professional certifications, people found it genuinely useful. Their feedback convinced me this could help a lot more students.

So I'm making it open-source. No paywalls, no data collection, no strings attached. Just a tool that makes studying with AI accessible to everyone who needs it.

### What StudyHub Does

- Upload and study from any PDF textbook, notes, or reference material
- Generate practice quizzes with multiple choice, short answer, and long-form questions
- Chat with an AI tutor that cites specific pages from your materials
- Track your performance over time to identify weak areas
- Get contextual YouTube video recommendations for topics you're learning
- Keep your data private—self-host it or use any AI provider you trust

## Features

### Core Functionality

**Smart Source Management**

Upload and organize multiple PDFs with drag-and-drop. Select specific materials when you want focused study sessions. Works with any educational content—textbooks, lecture notes, reference guides, whatever you're studying from.

**AI Quiz Generation**

Generate quizzes in multiple formats: multiple choice questions, short answer questions, and long answer questions. You can mix formats too. Get instant scoring with detailed explanations for each answer. All your quiz attempts are saved so you can review them later.

**RAG-Powered AI Chat**

Ask questions about your study materials and get answers with page-specific citations and relevant snippets. The PDF viewer sits right next to the chat so you can verify sources immediately. Works across all subjects—the topic detection is smart enough to understand what you're asking about.

**Progress Tracking**

Performance analytics with visual charts showing your improvement over time. See which topics you're strong in and which need more work. Review your quiz history and identify patterns in your learning.

**Smart Recommendations**

Get YouTube video suggestions based on what you're studying. The system detects topics dynamically, so it works for any subject. Pulls from quality educational channels like Khan Academy, CrashCourse, and 3Blue1Brown.

### Design

The interface is fully responsive—works on phones, tablets, and desktops. I went for a clean, ChatGPT-inspired look that stays out of your way. Fast performance, smooth interactions, nothing fancy that slows things down.

## Demo

**Live Demo**: [https://stdhub.surge.sh/](https://stdhub.surge.sh/)

**Test Credentials**:
- Email: `student@studyhub.com`
- Password: `testcreds1234`

### Screenshots

**Home - Upload & Manage Study Materials**

<img width="2558" alt="StudyHub Home" src="https://github.com/user-attachments/assets/5ee46ee3-e890-4ada-9013-063759f74735" />

**Quiz - Practice with AI-Generated Questions**

<img width="2558" alt="StudyHub Quiz" src="https://github.com/user-attachments/assets/4a872752-9fe9-4a3d-9cd9-6b074b8c06d5" />

**Chat - AI Tutor with Citations**

<img width="2558" alt="StudyHub Chat" src="https://github.com/user-attachments/assets/cc35b6bd-5cc2-4d76-b30d-b9d653d25721" />

**Profile - Track Your Progress**

<img width="2558" alt="StudyHub Profile" src="https://github.com/user-attachments/assets/ce4d7cbd-1f5f-49e1-b5fe-fd2567f0311e" />

## Tech Stack

**Frontend**
- React 19, TypeScript, Vite
- Tailwind CSS for styling
- React Router for navigation
- React PDF for document viewing
- Lucide Icons

**Backend & Database**
- Supabase (Authentication, PostgreSQL, Storage)
- Row-Level Security for data protection

**AI & Processing**
- OpenAI-compatible APIs (works with OpenAI, Grok, or self-hosted models)
- Custom RAG implementation for citations
- PDF text extraction and chunking

**Other Tools**
- Sonner for toast notifications
- UUID for unique identifiers

## Getting Started

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- Supabase account ([Sign up free](https://supabase.com))
- AI API key (OpenAI, Grok/xAI, or any OpenAI-compatible endpoint)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studyhub.git
   cd studyhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the project root:
   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # AI Provider Configuration (choose one)
   
   # Option 1: OpenAI
   VITE_AI_API_KEY=your_openai_api_key
   VITE_AI_API_BASE_URL=https://api.openai.com/v1
   VITE_AI_MODEL=gpt-4-turbo-preview
   
   # Option 2: Grok (xAI)
   # VITE_AI_API_KEY=your_grok_api_key
   # VITE_AI_API_BASE_URL=https://api.x.ai/v1
   # VITE_AI_MODEL=llama-3.3-70b-versatile
   
   # Option 3: Any OpenAI-compatible endpoint
   # VITE_AI_API_KEY=your_api_key
   # VITE_AI_API_BASE_URL=http://localhost:8000/v1
   # VITE_AI_MODEL=your-model-name
   ```

4. **Configure Supabase**
   
   a. Create a new Supabase project at [supabase.com](https://supabase.com)
   
   b. Copy your project URL and anon key to `.env`
   
   c. Set up the database:
      - Open Supabase SQL Editor
      - Run the schema from `sql.txt` (creates tables and indexes)
      - Apply RLS policies from `rls.txt`
   
   d. Configure Storage:
      - Create a new bucket named `study-app-pdfs`
      - Apply storage policies from `storage.txt`
   
   e. Enable Email Authentication:
      - Go to Authentication → Providers
      - Enable Email provider

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

6. **Create your account and start studying**
   - Sign up through the app
   - Upload your first PDF study material
   - Generate quizzes or start chatting with your AI tutor

### Deployment

Build for production and deploy to any static hosting:

```bash
npm run build
```

**Deploy to Surge:**
```bash
npm install -g surge
surge dist yourdomain.surge.sh
```

Also works with Vercel, Netlify, Cloudflare Pages, GitHub Pages, and similar platforms.

### Troubleshooting

If you run into issues:
- Double-check all `.env` values are correct (Supabase URL/key, AI key/endpoint/model)
- Make sure database tables, RLS policies, and storage bucket are properly configured
- Check browser console and network tab for specific errors
- Verify Node.js version is 18 or higher

## Development Notes

### Built with AI Assistance

I built this project quickly using LLMs (Claude, GPT, Grok) to generate roughly 60% of the code. They helped with:
- Component skeletons and service functions
- Prompt engineering for quiz generation and RAG
- Debugging Supabase RLS and React hooks
- Optimizing state management and styling

All AI-generated code was manually reviewed and customized for type safety, performance, and consistency. This approach let me move fast while maintaining quality through human oversight.

### Features

**Complete Core Features**
- Source selector with PDF upload
- PDF viewer with zoom, navigation, fullscreen
- Quiz generator (MCQ/SAQ/LAQ) with scoring and explanations
- Progress tracking with analytics dashboard
- Chat UI with RAG-powered answers and citations
- YouTube video recommendations with smart topic detection

**Production-Ready Aspects**
- Responsive design across all devices
- Clean UI/UX with loading states and error handling
- Robust database schema with Row-Level Security
- Validated by real users who depend on it daily

## Contributing

Contributions are welcome. Whether you're fixing bugs, adding features, improving documentation, or sharing ideas—your help makes StudyHub better for everyone.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Follow existing TypeScript and React best practices
- Maintain code style consistency
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation for new features
- Ensure proper TypeScript typing

## Community & Support

- **Issues**: [Report bugs or request features](https://github.com/yourusername/studyhub/issues)
- **Discussions**: [Ask questions or share ideas](https://github.com/yourusername/studyhub/discussions)
- **Pull Requests**: We review PRs regularly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

In plain English: use it, modify it, distribute it freely, even commercially. Just include the original license.

## Acknowledgments

- Built with assistance from Claude, GPT, and Grok for rapid prototyping
- Validated and refined by 10+ real learners using it for their studies
- Inspired by the belief that education should be accessible to all

---

If StudyHub helps you, consider giving it a star on GitHub. It helps others discover the project and motivates continued development.

---

Built for learners everywhere.

Questions? Ideas? Open an issue or start a discussion—I'm happy to help.
