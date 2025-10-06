export interface PDF {
  id: string;
  name: string;
  uploadedAt: string;
  fileUrl?: string;
  size?: number;
  numPages?: number;
  totalPages?: number;
  isSeeded?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'MCQ' | 'SAQ' | 'LAQ';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pageReference?: number;
  sourceSnippet?: string;
}

export interface Quiz {
  id: string;
  pdfId: string;
  questions: QuizQuestion[];
  createdAt: Date;
  type: 'MCQ' | 'SAQ' | 'LAQ' | 'MIXED';
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  pdfId: string;
  score: number;
  maxScore: number;
  correctAnswers: string[];
  userAnswers: Record<string, string>;
  completedAt: Date;
}

export interface UserProgress {
  totalQuizzes: number;
  averageScore: number;
  strengths: string[];
  weaknesses: string[];
  topicScores: Record<string, { correct: number; total: number }>;
  recentAttempts: QuizAttempt[];
}

export interface Citation {
  page: number;
  snippet: string;
  pdfId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Array<{
    page: number;
    snippet: string;
    pdfId: string;
  }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  pdfContext: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoRecommendation {
  id: string;
  title: string;
  channel: string;
  url: string;
  thumbnail: string;
  duration: string;
  relevanceScore?: number;
}

export type ViewMode = 'split' | 'tab';
export type QuizType = 'MCQ' | 'SAQ' | 'LAQ' | 'MIXED';