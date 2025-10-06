
import Dexie, {type Table } from 'dexie';
import { type PDF,type Quiz,type QuizAttempt,type ChatSession,type UserProgress } from '../types';

class StudyAppDatabase extends Dexie {
  pdfs!: Table<PDF, string>;
  quizzes!: Table<Quiz, string>;
  attempts!: Table<QuizAttempt, string>;
  chats!: Table<ChatSession, string>;

  constructor() {
    super('StudyAppDB');
    this.version(1).stores({
      pdfs: 'id, name, uploadedAt',
      quizzes: 'id, pdfId, createdAt',
      attempts: 'id, quizId, pdfId, completedAt',
      chats: 'id, createdAt, updatedAt'
    });
  }
}

const db = new StudyAppDatabase();

// PDF Operations
export const savePDF = async (pdf: PDF): Promise<void> => {
  await db.pdfs.put(pdf);
};

export const getAllPDFs = async (): Promise<PDF[]> => {
  return await db.pdfs.toArray();
};

export const getPDFById = async (id: string): Promise<PDF | undefined> => {
  return await db.pdfs.get(id);
};

export const deletePDF = async (id: string): Promise<void> => {
  await db.pdfs.delete(id);
};

// Quiz Operations
export const saveQuiz = async (quiz: Quiz): Promise<void> => {
  await db.quizzes.put(quiz);
};

export const getQuizzesByPDF = async (pdfId: string): Promise<Quiz[]> => {
  return await db.quizzes.where('pdfId').equals(pdfId).toArray();
};

export const getQuizById = async (id: string): Promise<Quiz | undefined> => {
  return await db.quizzes.get(id);
};

// Quiz Attempt Operations
export const saveQuizAttempt = async (attempt: QuizAttempt): Promise<void> => {
  await db.attempts.put(attempt);
};

export const getAttemptsByQuiz = async (quizId: string): Promise<QuizAttempt[]> => {
  return await db.attempts.where('quizId').equals(quizId).toArray();
};

export const getAllAttempts = async (): Promise<QuizAttempt[]> => {
  return await db.attempts.toArray();
};

// Progress Calculation
export const calculateUserProgress = async (): Promise<UserProgress> => {
  const attempts = await getAllAttempts();
  
  if (attempts.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      strengths: [],
      weaknesses: [],
      topicScores: {},
      recentAttempts: []
    };
  }

  const totalScore = attempts.reduce((sum, att) => sum + att.score, 0);
  const totalMaxScore = attempts.reduce((sum, att) => sum + att.maxScore, 0);
  const averageScore = (totalScore / totalMaxScore) * 100;

  // Calculate topic-wise performance
  const topicScores: Record<string, { correct: number; total: number }> = {};
  
  for (const attempt of attempts) {
    const quiz = await db.quizzes.get(attempt.quizId);
    if (!quiz) continue;

    for (const question of quiz.questions) {
      const topic = question.topic;
      if (!topicScores[topic]) {
        topicScores[topic] = { correct: 0, total: 0 };
      }
      
      topicScores[topic].total++;
      if (attempt.correctAnswers.includes(question.id)) {
        topicScores[topic].correct++;
      }
    }
  }

  // Identify strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const [topic, scores] of Object.entries(topicScores)) {
    const accuracy = (scores.correct / scores.total) * 100;
    if (accuracy >= 75) strengths.push(topic);
    if (accuracy < 50) weaknesses.push(topic);
  }

  return {
    totalQuizzes: attempts.length,
    averageScore,
    strengths,
    weaknesses,
    topicScores,
    recentAttempts: attempts.slice(-10).reverse()
  };
};

// Chat Operations
export const saveChatSession = async (session: ChatSession): Promise<void> => {
  await db.chats.put(session);
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
  return await db.chats.orderBy('updatedAt').reverse().toArray();
};

export const getChatSession = async (id: string): Promise<ChatSession | undefined> => {
  return await db.chats.get(id);
};

export const deleteChatSession = async (id: string): Promise<void> => {
  await db.chats.delete(id);
};

// Seed NCERT PDFs
// export const seedNCERTPDFs = async (): Promise<void> => {
//   const ncertPDFs: PDF[] = [
//     {
//       id: 'ncert-physics-11-1',
//       name: 'NCERT Class XI Physics - Part 1',
//       file: null,
//       url: 'https://ncert.nic.in/textbook/pdf/keph101.pdf',
//       uploadedAt: new Date(),
//       totalPages: 0,
//       isSeeded: true
//     },
//     {
//       id: 'ncert-physics-11-2',
//       name: 'NCERT Class XI Physics - Part 2',
//       file: null,
//       url: 'https://ncert.nic.in/textbook/pdf/keph201.pdf',
//       uploadedAt: new Date(),
//       totalPages: 0,
//       isSeeded: true
//     }
//   ];

//   for (const pdf of ncertPDFs) {
//     const existing = await getPDFById(pdf.id);
//     if (!existing) {
//       await savePDF(pdf);
//     }
//   }
// };

export default db;