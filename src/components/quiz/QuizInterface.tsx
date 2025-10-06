import { Clock, Send, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { type Quiz } from '../../types';
import QuizQuestion from './QuizQuestion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface QuizInterfaceProps {
  quiz: Quiz;
  answers: Record<string, string>;
  onAnswerChange: (answers: Record<string, string>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const QuizInterface = ({
  quiz,
  answers,
  onAnswerChange,
  onSubmit,
  onCancel
}: QuizInterfaceProps) => {
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quiz.questions.length) * 100;
  const allAnswered = answeredCount === quiz.questions.length;

  const handleAnswerSelect = (questionId: string, answer: string) => {
    onAnswerChange({ ...answers, [questionId]: answer });
  };

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <Card className="shadow-xl border-0 sticky top-20 z-40 bg-white/95 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{quiz.type} Quiz</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <Clock className="h-4 w-4" />
                  <span>{quiz.questions.length} Questions</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant={allAnswered ? "default" : "secondary"}
                className={`text-sm px-4 py-2 ${allAnswered
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : 'bg-slate-100 text-slate-700'
                  }`}
              >
                {allAnswered ? (
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-1" />
                )}
                {answeredCount} / {quiz.questions.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span className="font-medium">Progress</span>
              <span className="font-semibold">{progress.toFixed(0)}%</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div
                className="absolute top-0 left-0 h-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <QuizQuestion
            key={question.id}
            question={question}
            questionNumber={index + 1}
            userAnswer={answers[question.id]}
            onAnswerSelect={(answer) => handleAnswerSelect(question.id, answer)}
          />
        ))}
      </div>

      {/* Sticky Bottom Actions */}
      <Card className="shadow-2xl border-0 sticky bottom-4 bg-white/95 backdrop-blur-md">
        <CardContent className="p-6">
          {!allAnswered && (
            <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">
                    {quiz.questions.length - answeredCount} question{quiz.questions.length - answeredCount !== 1 ? 's' : ''} remaining
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Please answer all questions before submitting
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 border-2 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
              onClick={onCancel}
              size="lg"
            >
              Cancel Quiz
            </Button>
            <Button
              className={`flex-1 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 ${allAnswered ? 'hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'
                }`}
              onClick={onSubmit}
              disabled={!allAnswered}
              size="lg"
            >
              <Send className="text-white h-5 w-5 mr-2" />
              Submit Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizInterface;