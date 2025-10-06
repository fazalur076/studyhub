import { MessageSquare, Plus, Menu, X, Clock, Sparkles } from 'lucide-react';
import { type ChatSession } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ChatSidebar = ({
  sessions,
  currentSession,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggle
}: ChatSidebarProps) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - msgDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return msgDate.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-20 left-4 z-50 bg-white p-3 rounded-xl shadow-lg border-2 border-slate-200 hover:border-indigo-300 transition-all duration-300"
      >
        {isOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:relative z-40 w-80 bg-white border-r-2 border-slate-200 flex flex-col transition-transform duration-300 h-full`}
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Chat History</h2>
              <p className="text-xs text-slate-600">{sessions.length} conversation{sessions.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <Button
            onClick={onNewChat}
            className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 text-sm font-medium mb-1">No chats yet</p>
              <p className="text-slate-500 text-xs">Start a new conversation to begin!</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = currentSession?.id === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 border-2 group ${isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-500 shadow-lg scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}>
                      <MessageSquare className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate mb-1 ${isActive ? 'text-slate-800' : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                        {session.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className={`h-3 w-3 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className={`text-xs truncate ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {formatDate(session.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${isActive
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                          {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 animate-pulse"></div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Tip */}
        {sessions.length > 0 && (
          <div className="p-4 border-t-2 border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 mb-1">Quick Tip</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select a previous chat to continue the conversation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default ChatSidebar;