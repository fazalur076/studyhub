import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Sparkles, BookOpen, Zap, Target, X, Upload } from 'lucide-react';
import { getAllChatSessions, saveChatSession, getAllPDFs, deleteChatSession, uploadPDFFile, savePDF, savePDFText, getPDFById, getPDFText } from '../services/storage.service';
import { type ChatSession, type PDF } from '../types';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInterface from '../components/chat/ChatInterface';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import PDFUpload from '../components/pdf/PDFUpload';
import { getPDFMetadata, extractTextFromPDF } from '../services/pdf.service';

const ChatPage = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const stored = localStorage.getItem('selectedPDFs');
    if (stored) {
      try {
        setSelectedPDFs(JSON.parse(stored));
      } catch (err) {
        console.warn('Failed to parse selectedPDFs from localStorage:', stored, err);
        setSelectedPDFs([]);
        localStorage.removeItem('selectedPDFs');
      }
    } else {
      setSelectedPDFs([]);
    }
  }, []);

  const loadData = async () => {
    const allSessions = await getAllChatSessions();
    const allPDFs = await getAllPDFs();
    setSessions(allSessions);
    setPdfs(allPDFs);
  };

  const handleNewChat = () => {
    setShowSourceSelector(true);
    setCurrentSession(null);
    setMobileSidebarOpen(false);
  };
  const handleUploadFile = async (file: File) => {
    try {
      const fileUrl = await uploadPDFFile(file);
      const meta = await getPDFMetadata(file);
      const pdfText = await extractTextFromPDF(file);
      const id = uuidv4();
      const newPDF: PDF = {
        id,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        fileUrl: fileUrl,
        size: file.size,
        numPages: meta.numPages || 0,
        totalPages: meta.numPages || 0,
        isSeeded: false,
      };
      await savePDF(newPDF);
      await savePDFText(id, pdfText);
      const allPDFs = await getAllPDFs();
      setPdfs(allPDFs);
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF. Please try again.');
    }
  };

  const handleStartChat = async () => {
    if (selectedPDFs.length === 0) {
      toast.info('Please select at least one PDF');
      return;
    }
    localStorage.setItem('selectedPDFs', JSON.stringify(selectedPDFs));

    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      pdfContext: selectedPDFs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveChatSession(newSession);
    setCurrentSession(newSession);
    setShowSourceSelector(false);
    await loadData();
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setSelectedPDFs(session.pdfContext);
    setShowSourceSelector(false);
    setMobileSidebarOpen(false);
    localStorage.setItem('selectedPDFs', JSON.stringify(session.pdfContext));
  };

  const handleUpdateSession = async (updatedSession: ChatSession) => {
    await saveChatSession(updatedSession);
    setCurrentSession(updatedSession);
    await loadData();
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!sessionId) return;

    try {
      await deleteChatSession(sessionId);

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setSelectedPDFs([]);
        localStorage.removeItem('selectedPDFs');
      }

      console.log('Chat deleted successfully, UI updated');
    } catch (error) {
      console.error('Failed to delete chat', error);
      toast.error('Failed to delete chat. See console for details.');
    }
  };

  const suggestedPrompts = [
    { icon: Sparkles, text: "Explain this concept in simple terms", gradient: "from-purple-500 to-pink-500" },
    { icon: BookOpen, text: "Summarize the key points", gradient: "from-blue-500 to-cyan-500" },
    { icon: Zap, text: "Create practice questions", gradient: "from-orange-500 to-red-500" },
    { icon: MessageSquare, text: "Help me understand this topic", gradient: "from-green-500 to-emerald-500" }
  ];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] bg-slate-50 relative">
      {/* Desktop Sidebar */}
      <div className={`${showSourceSelector || currentSession ? 'hidden md:flex' : 'flex'} md:flex`}>
        <ChatSidebar
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-200 bg-white">
              <h3 className="font-semibold text-slate-800 text-lg">Chat History</h3>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all"
              >
                <X className="h-5 w-5 text-slate-700" />
              </button>
            </div>
            <div className="p-4">
              <ChatSidebar
                sessions={sessions}
                currentSession={currentSession}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                isOpen={true}
                onToggle={() => { }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {showSourceSelector ? (
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-yellow-300 animate-pulse" />
                  <span className="text-white/90 font-medium text-sm md:text-base">AI Chat Assistant</span>
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  Start a New<br />Conversation
                </h1>
                <p className="text-base md:text-xl text-white/90 max-w-2xl">
                  Select your study materials and get instant help from your AI tutor
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
              {/* Source Selection Card */}
              <Card className="shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 p-4 md:p-8">
                  {/* Desktop Layout */}
                  <div className="hidden md:flex md:items-center md:gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Select Study Materials</h3>
                      <p className="text-sm text-slate-600 mt-1">Choose the documents you want to chat about</p>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="flex flex-col items-center space-y-3 md:hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Select Study Materials</h3>
                        <p className="text-xs text-slate-600">Choose documents to chat about</p>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 md:p-8">
                  {pdfs.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4 text-sm md:text-base">No PDFs uploaded yet</p>
                      <Button variant="outline" className="border-2 hover:bg-slate-50" size="sm" onClick={() => setShowUpload(true)}>
                        <Upload className="h-4 w-4 mr-1" /> Upload Your First PDF
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {pdfs.map((pdf) => (
                        <div
                          key={pdf.id}
                          onClick={() => {
                            if (selectedPDFs.includes(pdf.id)) {
                              setSelectedPDFs(selectedPDFs.filter(id => id !== pdf.id));
                            } else {
                              setSelectedPDFs([...selectedPDFs, pdf.id]);
                            }
                          }}
                          className={`group p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedPDFs.includes(pdf.id)
                            ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg scale-[1.02]'
                            : 'border-slate-200 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01]'
                            }`}
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${selectedPDFs.includes(pdf.id)
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                              : 'bg-slate-100 group-hover:bg-slate-200'
                              }`}>
                              <BookOpen className={`h-5 w-5 md:h-6 md:w-6 ${selectedPDFs.includes(pdf.id) ? 'text-white' : 'text-slate-600'
                                }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm md:text-base text-slate-800 truncate">{pdf.name}</p>
                              <Badge
                                variant={pdf.isSeeded ? "default" : "secondary"}
                                className={`mt-1 text-xs ${pdf.isSeeded ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                              >
                                {pdf.isSeeded ? 'NCERT' : 'Uploaded'}
                              </Badge>
                            </div>
                            {selectedPDFs.includes(pdf.id) && (
                              <div className="w-6 h-6 md:w-7 md:h-7 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSourceSelector(false)}
                  size="lg"
                  className="flex-1 border-2 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 py-3 md:py-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartChat}
                  disabled={selectedPDFs.length === 0}
                  size="lg"
                  className={`flex-1 bg-gradient-to-r text-white from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 py-3 md:py-3 ${selectedPDFs.length > 0 ? 'hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <MessageSquare className="text-white h-5 w-5 mr-2" />
                  Start Chatting
                </Button>
              </div>

              {selectedPDFs.length === 0 && (
                <p className="text-center text-xs md:text-sm text-slate-500">
                  Please select at least one study material to continue
                </p>
              )}

              {/* Quick Tips Card */}
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">Pro Tips for Better Conversations</h4>
                      <ul className="space-y-1 text-xs md:text-sm text-slate-700">
                        <li>• Be specific with your questions for more accurate answers</li>
                        <li>• Reference page numbers or topics from your materials</li>
                        <li>• Ask follow-up questions to dive deeper into concepts</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : currentSession ? (
          <ChatInterface
            session={currentSession}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={() => handleDeleteSession(currentSession.id)}
            onOpenSidebar={() => setMobileSidebarOpen(true)}
          />

        ) : (
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 pb-20 md:pb-8">
            <div className="text-center max-w-2xl pb-6 md:pb-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 md:mb-3">
                Start a New Chat
              </h3>
              <p className="text-slate-600 mb-6 md:mb-8 text-base md:text-lg">
                Select your study materials and get instant help from your AI tutor
              </p>

              {/* Suggested Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                {suggestedPrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <Card
                      key={idx}
                      className="border-2 border-slate-200 transition-colors duration-200"
                    >
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r ${prompt.gradient} rounded-lg flex items-center justify-center`}>
                            <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                          </div>
                          <p className="text-xs md:text-sm font-medium text-slate-700 text-left">
                            {prompt.text}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Button
                onClick={handleNewChat}
                size="lg"
                className="bg-gradient-to-r text-white from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] px-6 md:px-8"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
      {showUpload && (
        <PDFUpload onUpload={handleUploadFile} onClose={() => setShowUpload(false)} />
      )}
    </div>
  );
};

export default ChatPage;