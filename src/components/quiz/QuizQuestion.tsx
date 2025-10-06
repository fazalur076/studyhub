import { CheckCircle2, XCircle, BookOpen, Lightbulb } from 'lucide-react';
import { type QuizQuestion as QuizQuestionType } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  userAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  showCorrectAnswer?: boolean;
}

const QuizQuestion = ({
  question,
  questionNumber,
  userAnswer,
  onAnswerSelect,
  showCorrectAnswer = false
}: QuizQuestionProps) => {
  const isAnswered = !!userAnswer;
  const isCorrectAnswer = showCorrectAnswer && userAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

  return (
    <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ${showCorrectAnswer
        ? isCorrectAnswer
          ? 'ring-2 ring-green-500'
          : 'ring-2 ring-red-500'
        : isAnswered
          ? 'ring-2 ring-indigo-500'
          : ''
      }`}>
      <CardContent className="p-0">
        {/* Question Header */}
        <div className={`p-6 ${showCorrectAnswer
            ? isCorrectAnswer
              ? 'bg-gradient-to-r from-green-50 to-emerald-50'
              : 'bg-gradient-to-r from-red-50 to-rose-50'
            : isAnswered
              ? 'bg-gradient-to-r from-indigo-50 to-purple-50'
              : 'bg-gradient-to-r from-slate-50 to-slate-100'
          }`}>
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md ${showCorrectAnswer
                ? isCorrectAnswer
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                : isAnswered
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-white text-slate-600 border-2 border-slate-300'
              }`}>
              {showCorrectAnswer ? (
                isCorrectAnswer ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )
              ) : (
                questionNumber
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-lg font-semibold text-slate-800 leading-relaxed">
                  {question.question}
                </p>
                {showCorrectAnswer && (
                  <Badge
                    variant="secondary"
                    className={isCorrectAnswer
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : 'bg-red-100 text-red-700 hover:bg-red-100'
                    }
                  >
                    {isCorrectAnswer ? 'Correct' : 'Incorrect'}
                  </Badge>
                )}
              </div>
              {question.pageReference && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BookOpen className="h-4 w-4" />
                  <span>Reference: Page {question.pageReference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answer Options/Input */}
        <div className="p-6">
          {question.type === 'MCQ' && question.options ? (
            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = userAnswer === option;
                const isCorrect = showCorrectAnswer && option.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                const isWrong = showCorrectAnswer && isSelected && option.toLowerCase().trim() !== question.correctAnswer.toLowerCase().trim();

                return (
                  <button
                    key={idx}
                    onClick={() => !showCorrectAnswer && onAnswerSelect(option)}
                    disabled={showCorrectAnswer}
                    className={`w-full text-left p-5 rounded-xl border-2 font-medium transition-all duration-300 group ${isCorrect
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                      : isWrong
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg'
                        : isSelected
                          ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md scale-[1.02]'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md hover:scale-[1.01]'
                      } ${showCorrectAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCorrect
                        ? 'border-green-500 bg-green-500'
                        : isWrong
                          ? 'border-red-500 bg-red-500'
                          : isSelected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-slate-300 group-hover:border-indigo-400'
                        }`}>
                        {(isSelected || isCorrect) && (
                          <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className={`flex-1 ${isCorrect || isWrong || isSelected
                        ? 'text-slate-800'
                        : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                        {option}
                      </span>
                      {isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {isWrong && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={userAnswer || ''}
                onChange={(e) => !showCorrectAnswer && onAnswerSelect(e.target.value)}
                disabled={showCorrectAnswer}
                placeholder="Type your answer here..."
                className={`w-full p-5 border-2 rounded-xl transition-all duration-300 resize-none ${showCorrectAnswer
                    ? 'border-slate-300 bg-slate-50 cursor-default'
                    : isAnswered
                      ? 'border-indigo-500 bg-indigo-50 focus:ring-2 focus:ring-indigo-500'
                      : 'border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                  } focus:outline-none`}
                rows={question.type === 'LAQ' ? 6 : 3}
              />
              {!showCorrectAnswer && !isAnswered && (
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Write a clear and concise answer</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Explanation Section */}
        {showCorrectAnswer && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-2">Explanation</p>
                <p className="text-slate-700 leading-relaxed">{question.explanation}</p>
                {question.type !== 'MCQ' && (
                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
                    <p className="font-semibold text-blue-900 mb-1">Correct Answer:</p>
                    <p className="text-slate-700">{question.correctAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizQuestion;