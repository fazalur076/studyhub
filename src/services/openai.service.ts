import OpenAI from 'openai';
import { type QuizQuestion, type QuizType } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  baseURL: import.meta.env.VITE_AI_API_BASE_URL,
  dangerouslyAllowBrowser: true
});

// Fallback models for different providers
const MODEL_FALLBACKS: Record<string, string> = {
  'llama-3.3-70b-versatile': 'llama-3.1-8b-instant',
  'deepseek-r1:free': 'zephyr-7b:free',
};

interface QuizGenerationOptions {
  pdfContent: string;
  quizType: QuizType;
  numQuestions: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const buildQuizPrompt = (
  content: string,
  type: QuizType,
  numQuestions: number,
  difficulty: string
): string => {
  const typeInstructions = {
    MCQ: 'Create multiple choice questions with 4 options each. Mark the correct answer clearly.',
    SAQ: 'Create short answer questions that can be answered in 2-3 sentences.',
    LAQ: 'Create long answer questions that require detailed explanations (5-7 sentences).',
    MIXED: 'Create a mix of MCQs, SAQs, and LAQs.'
  };

  return `
Based on the following textbook content, generate ${numQuestions} ${difficulty} difficulty ${type} questions.

${typeInstructions[type]}

Content:
${content.slice(0, 4000)}

Requirements:
1. Questions should test conceptual understanding, not just recall
2. Include page references if possible
3. Provide detailed explanations for each answer
4. Identify the topic/concept being tested
5. For MCQs, ensure distractors are plausible

Return the response as a JSON object with this structure:
{
  "questions": [
    {
      "type": "MCQ" | "SAQ" | "LAQ",
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "correct answer text",
      "explanation": "detailed explanation",
      "topic": "specific topic name",
      "difficulty": "${difficulty}",
      "pageReference": page_number
    }
  ]
}
`;
};

export const generateQuiz = async (
  options: QuizGenerationOptions
): Promise<QuizQuestion[]> => {
  const { pdfContent, quizType, numQuestions, difficulty = 'medium' } = options;

  const prompt = buildQuizPrompt(pdfContent, quizType, numQuestions, difficulty);

  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_AI_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator specializing in creating high-quality quiz questions from textbook content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.questions || [];
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    if (error?.code === 'model_decommissioned' && MODEL_FALLBACKS[import.meta.env.VITE_AI_MODEL]) {
      console.warn(`Model ${import.meta.env.VITE_AI_MODEL} decommissioned, trying fallback...`);
      return generateQuizWithFallback(options, MODEL_FALLBACKS[import.meta.env.VITE_AI_MODEL]);
    }
    throw new Error('Failed to generate quiz questions');
  }
};

async function generateQuizWithFallback(
    options: QuizGenerationOptions,
    fallbackModel: string
  ): Promise<QuizQuestion[]> {
    const { pdfContent, quizType, numQuestions, difficulty = 'medium' } = options;
    const prompt = buildQuizPrompt(pdfContent, quizType, numQuestions, difficulty);
    try {
      const response = await openai.chat.completions.create({
        model: fallbackModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in creating high-quality quiz questions from textbook content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.questions || [];
    } catch (error) {
      console.error('Fallback quiz generation failed:', error);
      throw new Error('Failed to generate quiz with fallback model');
    }
  }

// RAG-based Chat with Citations
interface ChatOptions {
  message: string;
  relevantChunks: Array<{
    content: string;
    page: number;
    pdfId: string;
  }>;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const buildChatPrompt = (
  message: string,
  chunks: Array<{ content: string; page: number; pdfId: string }>
): string => {
  const context = chunks
    .map(chunk => `[Page ${chunk.page}]\n${chunk.content}`)
    .join('\n\n');

  return `
User Question: ${message}

Relevant Content from Textbook:
${context}

Please answer the question using the provided content. Always cite the page numbers and include short quotes (2-3 lines) to support your answer.
`;
};

const extractCitations = (
  response: string,
  chunks: Array<{ content: string; page: number; pdfId: string }>
): Array<{ page: number; snippet: string; pdfId: string }> => {
  const citations: Array<{ page: number; snippet: string; pdfId: string }> = [];
  
  const pageMatches = response.matchAll(/page (\d+)/gi);
  
  for (const match of pageMatches) {
    const pageNum = parseInt(match[1]);
    const relevantChunk = chunks.find(c => c.page === pageNum);
    
    if (relevantChunk) {
      const quoteMatch = response.match(new RegExp(`page ${pageNum}[^'"]*['"]([^'"]{20,150})['"]`, 'i'));
      const snippet = quoteMatch ? quoteMatch[1] : relevantChunk.content.slice(0, 100);
      
      citations.push({
        page: pageNum,
        snippet,
        pdfId: relevantChunk.pdfId
      });
    }
  }
  
  return citations;
};

export const generateChatResponse = async (
  options: ChatOptions
): Promise<{ response: string; citations: Array<{ page: number; snippet: string; pdfId: string }> }> => {
  const { message, relevantChunks, chatHistory } = options;
  const contextPrompt = buildChatPrompt(message, relevantChunks);

  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_AI_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable tutor helping students understand their coursebook content. 
          Always cite your sources by referencing page numbers and quoting relevant snippets.
          Format citations as: "According to page X: 'quote...'"
          Be encouraging, clear, and educational in your responses.`
        },
        ...chatHistory.slice(-5),
        {
          role: 'user',
          content: contextPrompt
        }
      ],
      temperature: 0.7
    });

    const assistantMessage = response.choices[0].message.content || '';
    const citations = extractCitations(assistantMessage, relevantChunks);

    return {
      response: assistantMessage,
      citations
    };
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    if (error?.code === 'model_decommissioned' && MODEL_FALLBACKS[import.meta.env.VITE_AI_MODEL]) {
      console.warn(`Model ${import.meta.env.VITE_AI_MODEL} decommissioned, trying fallback...`);
      return generateChatResponseWithFallback(options, MODEL_FALLBACKS[import.meta.env.VITE_AI_MODEL]);
    }
    throw new Error('Failed to generate response');
  }
};

async function generateChatResponseWithFallback(
  options: ChatOptions,
  fallbackModel: string
): Promise<{ response: string; citations: Array<{ page: number; snippet: string; pdfId: string }> }> {
  const { message, relevantChunks, chatHistory } = options;
  const contextPrompt = buildChatPrompt(message, relevantChunks);

  try {
    const response = await openai.chat.completions.create({
      model: fallbackModel,
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable tutor helping students understand their coursebook content. 
          Always cite your sources by referencing page numbers and quoting relevant snippets.
          Format citations as: "According to page X: 'quote...'"
          Be encouraging, clear, and educational in your responses.`
        },
        ...chatHistory.slice(-5),
        {
          role: 'user',
          content: contextPrompt
        }
      ],
      temperature: 0.7
    });

    const assistantMessage = response.choices[0].message.content || '';
    const citations = extractCitations(assistantMessage, relevantChunks);

    return {
      response: assistantMessage,
      citations
    };
  } catch (error) {
    console.error('Error generating chat response with fallback:', error);
    throw new Error('Failed to generate response with fallback model');
  }
}

// Get YouTube video recommendations
export const getVideoRecommendations = async (
  topic: string,
  additionalContext?: string
): Promise<string[]> => {
  const prompt = `Generate 5 specific, educational YouTube video search queries for learning about: ${topic}
  ${additionalContext ? `Context: ${additionalContext}` : ''}
  
  Return queries that would find high-quality educational content (Khan Academy, CrashCourse, etc.)
  Return as JSON array: {"queries": ["query1", "query2", ...]}`;

  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_AI_MODEL || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5
    });

    const result = JSON.parse(response.choices[0].message.content || '{"queries": []}');
    return result.queries || [];
  } catch (error: any) {
    console.error('Error generating video queries:', error);
    if (error?.code === 'model_decommissioned' && MODEL_FALLBACKS[import.meta.env.VITE_AI_MODEL]) {
      console.warn(`Model ${import.meta.env.VITE_AI_MODEL} decommissioned, trying fallback...`);
      return getVideoRecommendationsWithFallback(topic, additionalContext, MODEL_FALLBACKS[import.meta.env.VITE_AI_MODEL]);
    }
    return [];
  }
};

async function getVideoRecommendationsWithFallback(
  topic: string,
  additionalContext: string | undefined,
  fallbackModel: string
): Promise<string[]> {
  const prompt = `Generate 5 specific, educational YouTube video search queries for learning about: ${topic}
  ${additionalContext ? `Context: ${additionalContext}` : ''}
  
  Return queries that would find high-quality educational content (Khan Academy, CrashCourse, etc.)
  Return as JSON array: {"queries": ["query1", "query2", ...]}`;

  try {
    const response = await openai.chat.completions.create({
      model: fallbackModel,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5
    });
    const result = JSON.parse(response.choices[0].message.content || '{"queries": []}');
    return result.queries || [];
  } catch (error) {
    console.error('Error generating video queries with fallback:', error);
    return [];
  }
}