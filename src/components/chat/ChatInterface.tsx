import { useState, useRef, useEffect } from 'react';
import { Send, Loader, BookOpen, MessageSquare, Sparkles, AlertCircle, Trash } from 'lucide-react';
import { type ChatSession, type ChatMessage } from '../../types';
import { generateChatResponse } from '../../services/openai.service';
import { getPDFText, getPDFById, deleteChatSession } from '../../services/storage.service';
import { chunkText, findRelevantChunks, extractTextFromPDF, extractTextFromURL, type PDFChunk } from '../../services/pdf.service';
import ChatMessageComponent from './ChatMessage';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import ConfirmModal from '../ui/confirmModal';

interface ChatInterfaceProps {
  session: ChatSession;
  onUpdateSession: (session: ChatSession) => void;
  onDeleteSession: () => void; // Add this prop to handle navigation after delete
}

const ChatInterface = ({ session, onUpdateSession, onDeleteSession }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfChunks, setPdfChunks] = useState<PDFChunk[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    loadPDFContent();
  }, [session.pdfContext]);

  const loadPDFContent = async () => {
    setLoadingPdfs(true);
    const allChunks: PDFChunk[] = [];

    try {
      for (const pdfId of session.pdfContext) {
        let pdfText = await getPDFText(pdfId);

        if (!pdfText) {
          const pdf = await getPDFById(pdfId);
          if (!pdf) continue;

          console.log(`Extracting text from ${pdf.name}...`);

          if (pdf.file) {
            pdfText = await extractTextFromPDF(pdf.file);
          } else if (pdf.url) {
            pdfText = await extractTextFromURL(pdf.url);
          }

          if (pdfText) {
            const { savePDFText } = await import('../../services/storage.service');
            await savePDFText(pdfId, pdfText);
          }
        }

        if (pdfText) {
          const chunks = chunkText(pdfText, pdfId);
          allChunks.push(...chunks);
          console.log(`Loaded ${chunks.length} chunks from PDF ${pdfId}`);
        }
      }

      setPdfChunks(allChunks);
      console.log(`Total chunks loaded: ${allChunks.length}`);
    } catch (error) {
      console.error('Error loading PDF content:', error);
    } finally {
      setLoadingPdfs(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const handleDeleteChat = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!session?.id) return;

    try {
      await deleteChatSession(session.id);
      onDeleteSession(); // parent removes this chat from state
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setConfirmOpen(false);
    }
  };


  const handleSendMessage = async () => {
    if (!input.trim() || loading || loadingPdfs) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
      updatedAt: new Date(),
      title: session.messages.length === 0 ? input.slice(0, 50) : session.title
    };

    onUpdateSession(updatedSession);
    setInput('');
    setLoading(true);

    try {
      const relevantChunks = findRelevantChunks(input, pdfChunks, 5);

      console.log(`Found ${relevantChunks.length} relevant chunks for query:`, input);

      if (relevantChunks.length === 0) {
        throw new Error('No relevant content found in the PDFs');
      }

      const response = await generateChatResponse({
        message: input,
        relevantChunks: relevantChunks.map(chunk => ({
          content: chunk.content,
          page: chunk.page,
          pdfId: chunk.pdfId
        })),
        chatHistory: session.messages.slice(-5).map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        citations: response.citations,
        timestamp: new Date()
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        updatedAt: new Date()
      };

      onUpdateSession(finalSession);
    } catch (error) {
      console.error('Error generating response:', error);

      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error && error.message.includes('No relevant content')
          ? "I couldn't find relevant information in your PDFs to answer this question. Please try rephrasing your question or make sure your PDFs contain the information you're looking for."
          : 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };

      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        updatedAt: new Date()
      };

      onUpdateSession(errorSession);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Explain this concept in simple terms",
    "What are the key points?",
    "Give me an example",
    "How does this work?"
  ];

  if (loadingPdfs) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-semibold text-slate-800 mb-2">Loading your study materials...</p>
          <p className="text-sm text-slate-600">Extracting text from PDFs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="border-b-2 border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{session.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center text-sm text-slate-600">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{session.pdfContext.length} source{session.pdfContext.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {pdfChunks.length} chunks loaded
                </Badge>
                <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteChat}
                className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
                title="Delete chat"
              >
                <Trash className="h-6 w-6 text-white" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {session.messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Start a Conversation
              </h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Ask questions about your coursebook and get instant, accurate answers from your AI tutor
              </p>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-all">
                        <MessageSquare className="h-4 w-4 text-slate-600 group-hover:text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {question}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {session.messages.map((message) => (
                <ChatMessageComponent key={message.id} message={message} />
              ))}
              {loading && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Loader className="h-5 w-5 animate-spin text-indigo-600" />
                      <span className="text-slate-600 font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ConfirmModal
        open={confirmOpen}
        title="Delete Chat?"
        description="Are you sure you want to delete this chat? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Input Area */}
      <div className="border-t-2 border-slate-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-300">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your coursebook..."
              disabled={loading || loadingPdfs}
              className="w-full p-5 bg-transparent resize-none focus:outline-none text-slate-800 placeholder:text-slate-400"
              rows={1}
              style={{ minHeight: '60px', maxHeight: '200px' }}
            />
            <div className="flex items-center justify-between p-4 pt-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <AlertCircle className="h-4 w-4" />
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading || loadingPdfs}
                className={`bg-gradient-to-r text-white from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 ${input.trim() && !loading && !loadingPdfs ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                  }`}
                size="lg"
              >
                <Send className="text-white h-5 w-5 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;