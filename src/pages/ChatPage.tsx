import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Sparkles, BookOpen, Zap, Target } from 'lucide-react';
import { getAllChatSessions, saveChatSession, getAllPDFs, deleteChatSession } from '../services/storage.service';
import { type ChatSession, type PDF } from '../types';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInterface from '../components/chat/ChatInterface';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { v4 as uuidv4 } from 'uuid';

const ChatPage = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  };

  const handleStartChat = async () => {
    if (selectedPDFs.length === 0) {
      alert('Please select at least one PDF');
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
      alert('Failed to delete chat. See console for details.');
    }
  };


  const suggestedPrompts = [
    { icon: Sparkles, text: "Explain this concept in simple terms", gradient: "from-purple-500 to-pink-500" },
    { icon: BookOpen, text: "Summarize the key points", gradient: "from-blue-500 to-cyan-500" },
    { icon: Zap, text: "Create practice questions", gradient: "from-orange-500 to-red-500" },
    { icon: MessageSquare, text: "Help me understand this topic", gradient: "from-green-500 to-emerald-500" }
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-slate-50">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {showSourceSelector ? (
          <div className="flex-1 overflow-y-auto">
            {/* Hero Section - matching quiz style */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-6 w-6 text-yellow-300 animate-pulse" />
                  <span className="text-white/90 font-medium">AI Chat Assistant</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  Start a New<br />Conversation
                </h1>
                <p className="text-xl text-white/90 max-w-2xl">
                  Select your study materials and get instant help from your AI tutor
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto p-8 space-y-8">
              {/* Source Selection Card - matching quiz style */}
              <Card className="shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Select Study Materials</h3>
                      <p className="text-sm text-slate-600 mt-1">Choose the documents you want to chat about</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-8">
                  {pdfs.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">No PDFs uploaded yet</p>
                      <Button
                        variant="outline"
                        className="border-2 hover:bg-slate-50"
                      >
                        Upload Your First PDF
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          className={`group p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedPDFs.includes(pdf.id)
                              ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg scale-[1.02]'
                              : 'border-slate-200 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01]'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedPDFs.includes(pdf.id)
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                                : 'bg-slate-100 group-hover:bg-slate-200'
                              }`}>
                              <BookOpen className={`h-6 w-6 ${selectedPDFs.includes(pdf.id) ? 'text-white' : 'text-slate-600'
                                }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 truncate">{pdf.name}</p>
                              <Badge
                                variant={pdf.isSeeded ? "default" : "secondary"}
                                className={`mt-1 ${pdf.isSeeded ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                              >
                                {pdf.isSeeded ? 'NCERT' : 'Uploaded'}
                              </Badge>
                            </div>
                            {selectedPDFs.includes(pdf.id) && (
                              <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
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

              {/* Action Buttons - matching quiz style */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSourceSelector(false)}
                  size="lg"
                  className="flex-1 border-2 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartChat}
                  disabled={selectedPDFs.length === 0}
                  size="lg"
                  className={`flex-1 bg-gradient-to-r text-white from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 ${selectedPDFs.length > 0 ? 'hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <MessageSquare className="text-white h-5 w-5 mr-2" />
                  Start Chatting
                </Button>
              </div>

              {selectedPDFs.length === 0 && (
                <p className="text-center text-sm text-slate-500">
                  Please select at least one study material to continue
                </p>
              )}

              {/* Quick Tips Card - matching quiz style */}
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Pro Tips for Better Conversations</h4>
                      <ul className="space-y-1 text-sm text-slate-700">
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
            />

        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">
                Start a New Chat
              </h3>
              <p className="text-slate-600 mb-8 text-lg">
                Select your study materials and get instant help from your AI tutor
              </p>

              {/* Suggested Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {suggestedPrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <Card
                      key={idx}
                      className="border-2 border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${prompt.gradient} rounded-lg flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 text-left group-hover:text-slate-900">
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
                className="bg-gradient-to-r text-white from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] px-8"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;