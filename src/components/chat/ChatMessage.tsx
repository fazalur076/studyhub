import { User, Bot, ExternalLink, Clock } from 'lucide-react';
import { type ChatMessage } from '../../types';
import VideoRecommendationButton from '../video/VideoRecommendationButton';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageComponent = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  const extractTopicFromMessage = (): string => {
    if (!isUser) {
      const assistantContent = message.content;
      
      const topicPatterns = [
        /(?:about|regarding|on)\s+([A-Z][^.!?]*?)(?:[.!?]|$)/i,
        /(?:explain|describe|discuss)\s+([A-Z][^.!?]*?)(?:[.!?]|$)/i,
        /(?:what is|what are)\s+([A-Z][^.!?]*?)(?:\?|$)/i,
        /(?:the concept of|the topic of)\s+([A-Z][^.!?]*?)(?:[.!?]|$)/i,
        /(?:understanding|learning about)\s+([A-Z][^.!?]*?)(?:[.!?]|$)/i,        
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s+is|\s+are|\s+refers|\s+means)/i,        
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s+is|\s+are|\s+refers|\s+means|\s+involves)/i,       
        /(?:the process of|the mechanism of|the theory of)\s+([A-Z][^.!?]*?)(?:[.!?]|$)/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s+formula|\s+equation|\s+law)/i
      ];
      
      for (const pattern of topicPatterns) {
        const match = assistantContent.match(pattern);
        if (match && match[1]) {
          const topic = match[1].trim();
          if (topic.length > 2 && !['The', 'This', 'That', 'These', 'Those'].includes(topic.split(' ')[0])) {
            return topic;
          }
        }
      }
      
      const words = assistantContent.split(/\s+/);
      const capitalizedTerms = [];
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (/^[A-Z][a-z]+$/.test(word)) {
          let term = word;
          let j = i + 1;
          while (j < words.length && /^[A-Z][a-z]+$/.test(words[j])) {
            term += ' ' + words[j];
            j++;
          }
          if (term.split(' ').length <= 4) {
            capitalizedTerms.push(term);
          }
          i = j - 1;
        }
      }
      
      if (capitalizedTerms.length > 0) {
        return capitalizedTerms.sort((a, b) => b.length - a.length)[0];
      }
      
      const meaningfulWords = words.filter(word => 
        word.length > 2 && 
        !['the', 'and', 'or', 'but', 'for', 'with', 'this', 'that', 'these', 'those'].includes(word.toLowerCase())
      );
      
      return meaningfulWords.slice(0, 3).join(' ');
    }
    return '';
  };

  const shouldShowVideoButton = (): boolean => {
    if (!isUser) {
      const assistantContent = message.content.toLowerCase();
      
      const explanationPatterns = [
        /explain/i,
        /describe/i,
        /discuss/i,
        /understand/i,
        /learn/i,
        /teach/i,
        /show/i,
        /demonstrate/i,
        /illustrate/i,
        /clarify/i,
        /according to/i,
        /as mentioned/i,
        /as stated/i,
        /this suggests/i,
        /this implies/i,
        /this indicates/i,
        /in summary/i,
        /additionally/i,
        /however/i,
        /thus/i,
        /therefore/i
      ];
      
      const hasCitations = Boolean(message.citations && message.citations.length > 0);
      
      return explanationPatterns.some(pattern => pattern.test(assistantContent)) || hasCitations;
    }
    return false;
  };

  return (
    <div className={`flex items-start gap-3 md:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isUser
          ? 'bg-gradient-to-r from-slate-600 to-slate-800'
          : 'bg-gradient-to-r from-indigo-600 to-purple-600'
        }`}>
        {isUser ? <User className="h-4 w-4 md:h-5 md:w-5 text-white" /> : <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />}
      </div>

      <div className="flex-1 max-w-full md:max-w-3xl">
        <div className={`group rounded-2xl p-4 md:p-6 transition-all duration-300 ${isUser
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.01]'
          : 'bg-white border-2 border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md'
          }`}>
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed break-words">{message.content}</p>

          {/* Timestamp */}
          <div className={`mt-3 flex items-center gap-2 text-xs ${isUser ? 'text-indigo-100' : 'text-slate-500'}`}>
            <Clock className="h-3 w-3" />
            <span>
              {(() => {
                try {
                  const d = typeof message.timestamp === 'string'
                    ? new Date(message.timestamp)
                    : new Date(message.timestamp as unknown as string);
                  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch {
                  return '';
                }
              })()}
            </span>
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-200/50">
              <p className={`text-xs font-semibold mb-2 md:mb-3 ${isUser ? 'text-indigo-100' : 'text-slate-600'}`}>
                Sources:
              </p>
              <div className="space-y-2">
                {message.citations.map((citation, idx) => (
                  <div
                    key={idx}
                    className={`group/cite bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 md:p-4 text-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium text-xs md:text-sm ${isUser ? 'text-indigo-700' : 'text-slate-800'}`}>
                        Page {citation.page}
                      </span>
                      <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-indigo-600 group-hover/cite:text-indigo-700" />
                    </div>
                    <p className={`text-xs italic break-words ${isUser ? 'text-indigo-800' : 'text-slate-600'}`}>
                      "{citation.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shouldShowVideoButton() && (
            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-200/50">
              <VideoRecommendationButton 
                topic={extractTopicFromMessage()}
                context={message.content}
                maxVideos={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageComponent;