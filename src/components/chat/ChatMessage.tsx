import { User, Bot, ExternalLink, Clock } from 'lucide-react';
import { type ChatMessage } from '../../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageComponent = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5 text-white" />
        </div>
      )}

      <div className={`flex-1 max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`group rounded-2xl p-6 transition-all duration-300 ${isUser
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.01]'
          : 'bg-white border-2 border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md'
          }`}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

          {/* Timestamp */}
          <div className={`mt-3 flex items-center gap-2 text-xs ${isUser ? 'text-indigo-100' : 'text-slate-500'}`}>
            <Clock className="h-3 w-3" />
            <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200/50">
              <p className={`text-xs font-semibold mb-3 ${isUser ? 'text-indigo-100' : 'text-slate-600'}`}>
                Sources:
              </p>
              <div className="space-y-2">
                {message.citations.map((citation, idx) => (
                  <div
                    key={idx}
                    className={`group/cite bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 text-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${isUser ? 'text-indigo-700' : 'text-slate-800'}`}>
                        Page {citation.page}
                      </span>
                      <ExternalLink className="h-4 w-4 text-indigo-600 group-hover/cite:text-indigo-700" />
                    </div>
                    <p className={`text-xs italic ${isUser ? 'text-indigo-800' : 'text-slate-600'}`}>
                      "{citation.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 order-1">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessageComponent;