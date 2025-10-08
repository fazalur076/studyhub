import { supabase } from './supabaseClient';
import { type PDF, type Quiz, type QuizAttempt, type ChatSession, type UserProgress } from '../types';

export const uploadPDFFile = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from('study-app-pdfs')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('study-app-pdfs')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const savePDF = async (pdf: PDF): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();

  const pdfData: any = {
    id: pdf.id,
    name: pdf.name,
    uploaded_at: pdf.uploadedAt,
    user_id: user?.id || null,
  };

  if ((pdf as any).fileUrl) pdfData.file_url = (pdf as any).fileUrl;
  if ((pdf as any).size) pdfData.size = (pdf as any).size;
  if ((pdf as any).numPages) pdfData.num_pages = (pdf as any).numPages;

  const { error } = await supabase
    .from('pdfs')
    .upsert(pdfData, { onConflict: 'id' });

  if (error) {
    console.error('Error saving PDF:', error);
    throw error;
  }
};

export const getAllPDFs = async (): Promise<PDF[]> => {
  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error getting PDFs:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    uploadedAt: row.uploaded_at,
    fileUrl: row.file_url,
    size: row.size,
    numPages: row.num_pages
  } as PDF));
};

export const getPDFById = async (id: string): Promise<PDF | undefined> => {
  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    console.error('Error getting PDF by ID:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    uploadedAt: data.uploaded_at,
    fileUrl: data.file_url,
    size: data.size,
    numPages: data.num_pages
  } as PDF;
};

export const deletePDF = async (pdfId: string): Promise<void> => {
  try {
    const pdf = await getPDFById(pdfId);

    if (pdf && (pdf as any).fileUrl) {
      const url = (pdf as any).fileUrl;
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error: storageError } = await supabase.storage
        .from('study-app-pdfs')
        .remove([fileName]);

      if (storageError) {
        console.warn('Error deleting file from storage:', storageError);
      }
    }

    const { error } = await supabase
      .from('pdfs')
      .delete()
      .eq('id', pdfId);

    if (error) {
      console.error('Error deleting PDF from database:', error);
      throw error;
    }

    console.log(`Deleted PDF ${pdfId} and related data`);
  } catch (err) {
    console.error('Error deleting PDF:', err);
    throw err;
  }
};

export const savePDFText = async (pdfId: string, text: string): Promise<void> => {
  const { error } = await supabase
    .from('pdf_texts')
    .upsert({
      id: pdfId,
      text: text
    });

  if (error) {
    console.error('Error saving PDF text:', error);
    throw error;
  }
};

export const getPDFText = async (pdfId: string): Promise<string | undefined> => {
  const { data, error } = await supabase
    .from('pdf_texts')
    .select('text')
    .eq('id', pdfId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    console.error('Error getting PDF text:', error);
    throw error;
  }

  return data?.text;
};

export const saveQuiz = async (quiz: Quiz): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('quizzes')
    .upsert({
      id: quiz.id,
      pdf_id: quiz.pdfId,
      questions: quiz.questions,
      created_at: quiz.createdAt,
      user_id: user?.id || null
    });

  if (error) {
    console.error('Error saving quiz:', error);
    throw error;
  }
};

export const getQuizzesByPDF = async (pdfId: string): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('pdf_id', pdfId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting quizzes by PDF:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    pdfId: row.pdf_id,
    questions: row.questions,
    createdAt: row.created_at,
    type: row.type || 'MIXED'
  }));
};

export const getQuizById = async (id: string): Promise<Quiz | undefined> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    console.error('Error getting quiz by ID:', error);
    throw error;
  }

  return {
    id: data.id,
    pdfId: data.pdf_id,
    questions: data.questions,
    createdAt: data.created_at,
    type: data.type || 'MIXED'
  };
};

export const saveQuizAttempt = async (attempt: QuizAttempt): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('quiz_attempts')
    .upsert({
      id: attempt.id,
      quiz_id: attempt.quizId,
      pdf_id: attempt.pdfId,
      score: attempt.score,
      max_score: attempt.maxScore,
      correct_answers: attempt.correctAnswers,
      completed_at: attempt.completedAt,
      user_id: user?.id || null
    });

  if (error) {
    console.error('Error saving quiz attempt:', error);
    throw error;
  }
};

export const getAttemptsByQuiz = async (quizId: string): Promise<QuizAttempt[]> => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error getting attempts by quiz:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    quizId: row.quiz_id,
    pdfId: row.pdf_id,
    score: row.score,
    maxScore: row.max_score,
    correctAnswers: row.correct_answers,
    completedAt: row.completed_at,
    userAnswers: row.user_answers || {}
  }));
};

export const getAllAttempts = async (): Promise<QuizAttempt[]> => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error getting all attempts:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    quizId: row.quiz_id,
    pdfId: row.pdf_id,
    score: row.score,
    maxScore: row.max_score,
    correctAnswers: row.correct_answers,
    completedAt: row.completed_at,
    userAnswers: row.user_answers || {}
  }));
};

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

  const normalizeTopic = (raw: string | undefined): string => {
    if (!raw) return 'General';
    const cleaned = raw
      .toLowerCase()
      .replace(/chapter\s*\d+|section\s*\d+|exercise\s*\d+/g, '')
      .replace(/\b(index|contents|table of contents|acknowledg(e)?ments?)\b/g, '')
      .replace(/[^a-z0-9\s'\-()]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    // collapse overly generic headings
    if (!cleaned || cleaned.length < 3) return 'General';
    return cleaned
      .split(' ')
      .slice(0, 6) // keep it concise
      .join(' ');
  };

  for (const attempt of attempts) {
    const quiz = await getQuizById(attempt.quizId);
    if (!quiz) continue;

    for (const question of quiz.questions) {
      const topic = normalizeTopic(question.topic);
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
    recentAttempts: attempts.slice(0, 10)
  };
};

export const saveChatSession = async (session: ChatSession): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('chat_sessions')
    .upsert({
      id: session.id,
      messages: session.messages,
      pdf_context: session.pdfContext || [],
      created_at: session.createdAt,
      updated_at: session.updatedAt || new Date().toISOString(),
      user_id: user?.id || null
    });

  if (error) {
    console.error('Error saving chat session:', error);
    throw error;
  }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error getting all chat sessions:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    messages: row.messages || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pdfContext: row.pdf_context || row.pdfContext || [],
    title: row.title || 'New Chat'
  }));
};

export const getChatSession = async (id: string): Promise<ChatSession | undefined> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    console.error('Error getting chat session:', error);
    throw error;
  }

  return {
    id: data.id,
    messages: data.messages || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pdfContext: data.pdf_context || data.pdfContext || [],
    title: data.title || 'New Chat'
  };
};

export const deleteChatSession = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }

    console.log('Deleted chat session:', id);
  } catch (err) {
    console.error('deleteChatSession failed:', err);
    throw err;
  }
};

export default {};