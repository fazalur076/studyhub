import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from './supabaseClient';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export interface PDFChunk {
  content: string;
  page: number;
  pdfId: string;
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += `\n[Page ${pageNum}]\n${pageText}\n`;
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const extractTextFromURL = async (url: string): Promise<string> => {
  try {
    const pdf = await pdfjsLib.getDocument(url).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += `\n[Page ${pageNum}]\n${pageText}\n`;
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text from URL:', error);
    throw new Error('Failed to extract text from PDF URL');
  }
};

export const extractTextFromSupabasePDF = async (fileName: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from('study-app-pdfs')
      .download(fileName);

    if (error) throw error;

    const arrayBuffer = await data.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += `\n[Page ${pageNum}]\n${pageText}\n`;
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from Supabase PDF:', error);
    throw new Error('Failed to extract text from Supabase PDF');
  }
};

export const getPDFMetadata = async (file: File): Promise<{
  numPages: number;
  title?: string;
  author?: string;
}> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const metadata = await pdf.getMetadata();

    return {
      numPages: pdf.numPages,
      title: metadata.info?.Title,
      author: metadata.info?.Author
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    return { numPages: 0 };
  }
};

export const getPDFMetadataFromURL = async (url: string): Promise<{
  numPages: number;
  title?: string;
  author?: string;
}> => {
  try {
    const pdf = await pdfjsLib.getDocument(url).promise;
    const metadata = await pdf.getMetadata();

    return {
      numPages: pdf.numPages,
      title: metadata.info?.Title,
      author: metadata.info?.Author
    };
  } catch (error) {
    console.error('Error getting PDF metadata from URL:', error);
    return { numPages: 0 };
  }
};

export const chunkText = (
  text: string,
  pdfId: string,
  chunkSize: number = 1000,
  overlap: number = 200
): PDFChunk[] => {
  const chunks: PDFChunk[] = [];
  const pageMatches = text.split(/\[Page (\d+)\]/);

  for (let i = 1; i < pageMatches.length; i += 2) {
    const pageNum = parseInt(pageMatches[i]);
    const pageContent = pageMatches[i + 1] || '';

    for (let j = 0; j < pageContent.length; j += chunkSize - overlap) {
      const chunk = pageContent.slice(j, j + chunkSize).trim();
      if (chunk.length > 100) {
        chunks.push({
          content: chunk,
          page: pageNum,
          pdfId
        });
      }
    }
  }

  return chunks;
};

export const findRelevantChunks = (
  query: string,
  chunks: PDFChunk[],
  topK: number = 5
): PDFChunk[] => {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);

  const scoredChunks = chunks.map(chunk => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
      score += matches * word.length;
    }

    if (contentLower.includes(queryLower)) {
      score += 100;
    }

    return { chunk, score };
  });

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.chunk);
};