import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from PDF file
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
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

/**
 * Get PDF metadata
 */
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

/**
 * Chunk text into smaller pieces for RAG
 */
export const chunkText = (
  text: string,
  chunkSize: number = 1000
): Array<{ content: string; page: number }> => {
  const chunks: Array<{ content: string; page: number }> = [];
  const pageMatches = text.split(/\[Page (\d+)\]/);
  
  for (let i = 1; i < pageMatches.length; i += 2) {
    const pageNum = parseInt(pageMatches[i]);
    const pageContent = pageMatches[i + 1] || '';
    
    // Split page content into chunks
    for (let j = 0; j < pageContent.length; j += chunkSize) {
      const chunk = pageContent.slice(j, j + chunkSize).trim();
      if (chunk.length > 100) {
        chunks.push({
          content: chunk,
          page: pageNum
        });
      }
    }
  }
  
  return chunks;
};
