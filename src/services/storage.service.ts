import Dexie, { type Table } from 'dexie';
import { type PDF, type Quiz, type QuizAttempt, type ChatSession, type UserProgress } from '../types';

class StudyAppDatabase extends Dexie {
  pdfs!: Table<PDF, string>;
  quizzes!: Table<Quiz, string>;
  attempts!: Table<QuizAttempt, string>;
  chats!: Table<ChatSession, string>;
  pdfTexts!: Table<{ id: string; text: string }, string>;

  constructor() {
    super('StudyAppDB');

    this.version(2).stores({
      pdfs: 'id, name, uploadedAt',
      quizzes: 'id, pdfId, createdAt',
      attempts: 'id, quizId, pdfId, completedAt',
      chats: 'id, createdAt, updatedAt',
      pdfTexts: 'id'
    });

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

export const deletePDF = async (pdfId: string) => {
  try {
    await db.pdfs.delete(pdfId);
    await db.pdfTexts.delete(pdfId);

    const quizzes = await db.quizzes.where('pdfId').equals(pdfId).toArray();
    for (const quiz of quizzes) await db.quizzes.delete(quiz.id);

    const attempts = await db.attempts.where('pdfId').equals(pdfId).toArray();
    for (const attempt of attempts) await db.attempts.delete(attempt.id);

    console.log(`Deleted PDF ${pdfId} and related data`);
  } catch (err) {
    console.error('Error deleting PDF:', err);
    throw err;
  }
};

export const savePDFText = async (pdfId: string, text: string): Promise<void> => {
  await db.pdfTexts.put({ id: pdfId, text });
};

export const getPDFText = async (pdfId: string): Promise<string | undefined> => {
  const result = await db.pdfTexts.get(pdfId);
  return result?.text;
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
  try {
    const deleted = await db.chats.delete(id);
    console.log('Deleted chat session:', id, deleted);
  } catch (err) {
    console.error('deleteChatSession failed:', err);
    throw err;
  }
};

export default db;