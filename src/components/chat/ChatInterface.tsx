import { useState, useRef, useEffect } from 'react';
import { Send, Loader, BookOpen, MessageSquare, Sparkles, AlertCircle, Trash, Menu, X } from 'lucide-react';
import { type ChatSession, type ChatMessage } from '../../types';
import { generateChatResponse } from '../../services/openai.service';
import { getPDFText, getPDFById, deleteChatSession } from '../../services/storage.service';
import { chunkText, findRelevantChunks, extractTextFromURL, type PDFChunk } from '../../services/pdf.service';
import ChatMessageComponent from './ChatMessage';
import PDFViewer from '../pdf/PDFViewer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import ConfirmModal from '../ui/confirmModal';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  session: ChatSession;
  onUpdateSession: (session: ChatSession) => void;
  onDeleteSession: () => void;
  onOpenSidebar?: () => void;
}

const ChatInterface = ({ session, onUpdateSession, onDeleteSession, onOpenSidebar }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfChunks, setPdfChunks] = useState<PDFChunk[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [activePDFId, setActivePDFId] = useState<string | null>(
    session.pdfContext?.length ? session.pdfContext[0] : null
  );
  const [showPDFPanel, setShowPDFPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pdfDetails, setPdfDetails] = useState<Map<string, { name: string, numPages: number }>>(new Map());

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
    const details = new Map<string, { name: string, numPages: number }>();

    try {
      const pdfContextArray = Array.isArray(session.pdfContext) ? session.pdfContext : [];

      for (const pdfId of pdfContextArray) {
        let pdfText = await getPDFText(pdfId);
        const pdf = await getPDFById(pdfId);

        if (pdf) {
          details.set(pdfId, {
            name: pdf.name,
            numPages: pdf.numPages || 0
          });
        }

        if (!pdfText) {
          if (!pdf) continue;

          if (pdf.fileUrl) {
            pdfText = await extractTextFromURL(pdf.fileUrl);
          }

          if (pdfText) {
            const { savePDFText } = await import('../../services/storage.service');
            await savePDFText(pdfId, pdfText);
          }
        }

        if (pdfText) {
          const chunks = chunkText(pdfText, pdfId);
          allChunks.push(...chunks);
        }
      }

      setPdfChunks(allChunks);
      setPdfDetails(details);
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

  const handleDeleteChat = () => setConfirmOpen(true);

  const handleConfirmDelete = async () => {
    if (!session?.id) return;

    try {
      await deleteChatSession(session.id);
      onDeleteSession();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat. Please try again.');
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
      timestamp: new Date().toISOString()
    };

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
      updatedAt: new Date().toISOString(),
      title: session.messages.length === 0 ? input.slice(0, 50) : session.title
    };

    onUpdateSession(updatedSession);
    setInput('');
    setLoading(true);

    try {
      const relevantChunks = findRelevantChunks(input, pdfChunks, 5);

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
        timestamp: new Date().toISOString()
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        updatedAt: new Date().toISOString()
      };

      onUpdateSession(finalSession);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error && error.message.includes('No relevant content')
          ? "I couldn't find relevant information in your PDFs. Try rephrasing your question or check your PDFs."
          : 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString()
      };

      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        updatedAt: new Date().toISOString()
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
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <p className="text-base md:text-lg font-semibold text-slate-800 mb-2">Loading your study materials...</p>
          <p className="text-xs md:text-sm text-slate-600">Extracting text from PDFs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="border-b-2 border-slate-200 bg-white shadow-sm">
        <div className="p-3 md:p-6">
          {/* Desktop Header */}
          <div className="hidden md:flex md:items-center md:justify-between">
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
                onClick={() => setShowPDFPanel(prev => !prev)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-200 hover:bg-indigo-300 hover:scale-105 transition-transform shadow-sm hover:shadow-md"
                title={showPDFPanel ? "Hide PDF" : "Show PDF"}
                aria-label={showPDFPanel ? "Hide PDF Panel" : "Show PDF Panel"}
              >
                <BookOpen className="h-6 w-6 text-indigo-700" />
                <span className="font-medium text-indigo-800">{showPDFPanel ? "Hide PDF" : "Show PDF"}</span>
              </button>

              <button
                onClick={handleDeleteChat}
                className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
                title="Delete chat"
              >
                <Trash className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex flex-col space-y-2 md:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {onOpenSidebar && (
                  <button
                    onClick={onOpenSidebar}
                    className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                    title="Open chat history"
                  >
                    <Menu className="h-5 w-5 text-slate-700" />
                  </button>
                )}
                <h2 className="text-base font-bold text-slate-800 truncate">{session.title}</h2>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowPDFPanel(true)}
                  className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl flex items-center justify-center transition-all duration-300"
                  title="View PDF"
                >
                  <BookOpen className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={handleDeleteChat}
                  className="w-9 h-9 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl flex items-center justify-center transition-all duration-300"
                  title="Delete chat"
                >
                  <Trash className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BookOpen className="h-3 w-3" />
              <span>{session.pdfContext.length} source{session.pdfContext.length !== 1 ? 's' : ''}</span>
              <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
              <span>{session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className={`flex-1 flex flex-col ${showPDFPanel ? 'md:max-w-2xl' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6 pb-20 md:pb-6">
              {session.messages.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 md:mb-3">Start a Conversation</h3>
                  <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8 max-w-md mx-auto px-4">
                    Ask questions about your coursebook and get instant, accurate answers from your AI tutor
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-w-2xl mx-auto px-4">
                    {suggestedQuestions.map((q, idx) => (
                      <button key={idx} onClick={() => setInput(q)}
                        className="p-3 md:p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 text-left group">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 bg-slate-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-all">
                            <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-slate-600 group-hover:text-indigo-600" />
                          </div>
                          <span className="text-xs md:text-sm font-medium text-slate-700 group-hover:text-slate-900">{q}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {session.messages.map(msg => (
                    <ChatMessageComponent key={msg.id} message={msg} />
                  ))}
                  {loading && (
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div className="flex-1 bg-white rounded-2xl border-2 border-slate-200 p-4 md:p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                          <Loader className="h-4 w-4 md:h-5 md:w-5 animate-spin text-indigo-600" />
                          <span className="text-sm md:text-base text-slate-600 font-medium">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Input Area - FIXED: Added pb-20 md:pb-0 to avoid mobile bottom bar */}
          <div className="border-t-2 border-slate-200 bg-white shadow-lg pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto p-3 md:p-6">
              <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-300">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about your coursebook..."
                  disabled={loading || loadingPdfs}
                  className="w-full p-3 md:p-5 bg-transparent resize-none focus:outline-none text-sm md:text-base text-slate-800 placeholder:text-slate-400"
                  rows={1}
                  style={{ minHeight: '50px', maxHeight: '200px' }}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 md:p-4 pt-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
                    <span className="sm:hidden">Enter to send</span>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading || loadingPdfs}
                    className={`bg-gradient-to-r text-white from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 ${input.trim() && !loading && !loadingPdfs ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                      }`}
                    size="sm"
                  >
                    <Send className="text-white h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                    <span className="text-sm md:text-base">Send</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer Panel */}
        {showPDFPanel && activePDFId && (
          <>
            {/* Mobile Overlay - Above header with higher z-index */}
            <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setShowPDFPanel(false)}>
              <div className="absolute inset-0 flex flex-col bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-2 overflow-x-auto flex-1 mr-2">
                    {session.pdfContext.map(pdfId => {
                      const detail = pdfDetails.get(pdfId);
                      return (
                        <Button
                          key={pdfId}
                          onClick={() => setActivePDFId(pdfId)}
                          size="sm"
                          variant={activePDFId === pdfId ? 'default' : 'outline'}
                          className={`flex-shrink-0 text-xs ${activePDFId === pdfId
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                              : 'border-2 hover:border-indigo-300'
                            }`}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          {detail ? detail.name.slice(0, 15) + (detail.name.length > 15 ? '...' : '') : 'Loading...'}
                        </Button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowPDFPanel(false)}
                    className="w-9 h-9 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                    title="Close PDF"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <PDFViewer pdfUrl={activePDFId} />
                </div>
              </div>
            </div>

            {/* Desktop Panel */}
            <div className="hidden md:flex flex-1 border-l border-slate-200 overflow-hidden flex-col">
              <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center gap-2 overflow-x-auto">
                {session.pdfContext.map(pdfId => {
                  const detail = pdfDetails.get(pdfId);
                  return (
                    <Button
                      key={pdfId}
                      onClick={() => setActivePDFId(pdfId)}
                      size="sm"
                      variant={activePDFId === pdfId ? 'default' : 'outline'}
                      className={`flex-shrink-0 ${activePDFId === pdfId
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                          : 'border-2 hover:border-indigo-300'
                        }`}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {detail ? detail.name.slice(0, 20) + (detail.name.length > 20 ? '...' : '') : 'Loading...'}
                    </Button>
                  );
                })}
              </div>
              <div className="flex-1 overflow-hidden">
                <PDFViewer pdfUrl={activePDFId} />
              </div>
            </div>
          </>
        )}
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
    </div>
  );
};

export default ChatInterface;