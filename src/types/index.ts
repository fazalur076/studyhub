// src/types/index.ts

export interface PDF {
  id: string;
  name: string;
  file: File | null;
  url?: string;
  uploadedAt: Date;
  totalPages: number;
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
  answers: Record<string, string>;
  score: number;
  maxScore: number;
  completedAt: Date;
  timeSpent: number;
  correctAnswers: string[];
  incorrectAnswers: string[];
}

export interface UserProgress {
  totalQuizzes: number;
  averageScore: number;
  strengths: string[];
  weaknesses: string[];
  topicScores: Record<string, { correct: number; total: number }>;
  recentAttempts: QuizAttempt[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export interface Citation {
  page: number;
  snippet: string;
  pdfId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  pdfContext: string[];
  createdAt: Date;
  updatedAt: Date;
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