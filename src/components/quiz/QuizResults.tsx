import { useEffect } from 'react';
import { Trophy, RefreshCw, BarChart3, Target, CheckCircle2, XCircle, TrendingUp, Award, Sparkles, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type Quiz, type QuizAttempt } from '../../types';
import QuizQuestion from './QuizQuestion';
import VideoRecommendationButton from '../video/VideoRecommendationButton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  userAnswers: Record<string, string>;
  onNewQuiz: () => void;
}

const QuizResults = ({ quiz, attempt, userAnswers, onNewQuiz }: QuizResultsProps) => {
  const navigate = useNavigate();
  const percentage = (attempt.score / attempt.maxScore) * 100;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const correctAnswers = quiz.questions.filter(q =>
    userAnswers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
  ).length;

  const incorrectAnswers = quiz.questions.length - correctAnswers;

  const getQuizTopic = (): string => {
    const topics = quiz.questions
      .map(q => q.topic)
      .filter(Boolean)
      .filter((topic, index, arr) => arr.indexOf(topic) === index);
    
    if (topics.length > 0) {
      return topics.slice(0, 2).join(' and ');
    }
    
    return `${quiz.type} Questions`;
  };

  const getGrade = () => {
    if (percentage >= 90) return {
      grade: 'A+',
      color: 'text-green-600',
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-500',
      message: 'Outstanding Performance!',
      emoji: '🌟'
    };
    if (percentage >= 80) return {
      grade: 'A',
      color: 'text-green-600',
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-400',
      message: 'Excellent Work!',
      emoji: '🎉'
    };
    if (percentage >= 70) return {
      grade: 'B',
      color: 'text-blue-600',
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      border: 'border-blue-400',
      message: 'Great Job!',
      emoji: '👏'
    };
    if (percentage >= 60) return {
      grade: 'C',
      color: 'text-yellow-600',
      bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
      border: 'border-yellow-400',
      message: 'Good Effort!',
      emoji: '💪'
    };
    return {
      grade: 'D',
      color: 'text-orange-600',
      bg: 'bg-gradient-to-r from-orange-50 to-red-50',
      border: 'border-orange-400',
      message: 'Keep Practicing!',
      emoji: '📚'
    };
  };

  const { grade, color, bg, border, message, emoji } = getGrade();

  return (
    <div className="space-y-8">
      {/* Hero Results Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-full mb-6 animate-bounce">
            <Trophy className="h-12 w-12 text-yellow-300" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {message}
          </h1>

          <p className="text-xl text-white/90 mb-8">
            You've completed the {quiz.type} Quiz
          </p>

          <div className="flex items-center justify-center gap-2 text-white/80">
            <Sparkles className="h-5 w-5" />
            <span className="text-lg">Quiz Results Ready</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Score Card */}
        <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                Score
              </Badge>
            </div>
            <p className="text-4xl font-bold text-slate-800 mb-1">
              {attempt.score}<span className="text-2xl text-slate-500">/{attempt.maxScore}</span>
            </p>
            <p className="text-sm text-slate-600">Total Points</p>
          </CardContent>
        </Card>

        {/* Grade Card */}
        <Card className={`shadow-xl border-2 ${border} overflow-hidden ${bg}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center border-2 ${border}`}>
                <Award className={`h-6 w-6 ${color}`} />
              </div>
              <span className="text-3xl">{emoji}</span>
            </div>
            <p className={`text-4xl font-bold ${color} mb-1`}>
              {grade}
            </p>
            <p className="text-sm text-slate-600">Your Grade</p>
          </CardContent>
        </Card>

        {/* Percentage Card */}
        <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Accuracy
              </Badge>
            </div>
            <p className="text-4xl font-bold text-slate-800 mb-1">
              {percentage.toFixed(0)}%
            </p>
            <p className="text-sm text-slate-600">Correct Rate</p>
          </CardContent>
        </Card>

        {/* Correct/Incorrect Card */}
        <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                Breakdown
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{correctAnswers}</span>
              </div>
              <div className="h-8 w-px bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold text-red-600">{incorrectAnswers}</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Correct / Incorrect</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onNewQuiz}
              size="lg"
              className="flex-1 p-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <RefreshCw className="text-white h-5 w-5 mr-2" />
              Generate New Quiz
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/profile')}
              className="flex-1 p-3 border-2 border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              View Profile
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
              className="flex-1 p-3 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insight */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <div className={`${bg} border-b-2 ${border}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center border-2 ${border}`}>
                <Sparkles className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <CardTitle className="text-2xl">Performance Insight</CardTitle>
                <p className="text-slate-600 text-sm mt-1">How you did on this quiz</p>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0 border ${border}`}>
                <Award className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Overall Assessment</h4>
                <p className="text-slate-700 leading-relaxed">
                  {percentage >= 90 && "Exceptional work! You've demonstrated a thorough understanding of the material. Keep up this outstanding performance!"}
                  {percentage >= 80 && percentage < 90 && "Excellent performance! You have a strong grasp of the concepts. Review the areas you missed to achieve perfection."}
                  {percentage >= 70 && percentage < 80 && "Good job! You understand most of the material. Focus on the topics where you lost points to improve further."}
                  {percentage >= 60 && percentage < 70 && "Decent effort! You're on the right track. Spend more time reviewing the material to strengthen your understanding."}
                  {percentage < 60 && "Keep practicing! Review the study materials carefully and try again. Every attempt helps you learn and improve."}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span className="font-medium">Quiz Completion</span>
                <span className="font-semibold">100%</span>
              </div>
              <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(correctAnswers / quiz.questions.length) * 100}%` }}
                />
                <div
                  className="absolute top-0 h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(incorrectAnswers / quiz.questions.length) * 100}%`,
                    left: `${(correctAnswers / quiz.questions.length) * 100}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Correct ({correctAnswers})
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Incorrect ({incorrectAnswers})
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Answers Section */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Detailed Review</CardTitle>
              <p className="text-slate-600 text-sm mt-1">Review all questions and their correct answers</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {quiz.questions.map((question, index) => (
            <QuizQuestion
              key={question.id}
              question={question}
              questionNumber={index + 1}
              userAnswer={userAnswers[question.id]}
              onAnswerSelect={() => { }}
              showCorrectAnswer={true}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Want to learn more?</h3>
            <p className="text-slate-600 text-sm mb-4">Get video recommendations for topics you missed</p>
            <VideoRecommendationButton 
              topic={getQuizTopic()}
              context={`Quiz on ${quiz.type} questions with ${percentage.toFixed(0)}% score`}
              maxVideos={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;