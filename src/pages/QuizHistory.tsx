import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Clock, Target, Trophy, FileText, Eye, Calendar, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getAllAttempts, getQuizById, getPDFById } from '../services/storage.service';
import { type QuizAttempt, type Quiz, type PDF } from '../types';

interface AttemptWithDetails extends QuizAttempt {
  quiz?: Quiz;
  pdf?: PDF;
}

const QuizHistory = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const allAttempts = await getAllAttempts();
      
      // Sort by date (newest first)
      const sortedAttempts = allAttempts.sort((a, b) => 
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );

      // Load quiz and PDF details for each attempt
      const attemptsWithDetails = await Promise.all(
        sortedAttempts.map(async (attempt) => {
          const quiz = await getQuizById(attempt.quizId);
          const pdf = quiz ? await getPDFById(quiz.pdfId) : undefined;
          return { ...attempt, quiz, pdf };
        })
      );

      setAttempts(attemptsWithDetails);

      // Calculate stats
      if (allAttempts.length > 0) {
        const totalScore = allAttempts.reduce((sum, att) => sum + att.score, 0);
        const totalMax = allAttempts.reduce((sum, att) => sum + att.maxScore, 0);
        const bestPercentage = Math.max(...allAttempts.map(att => (att.score / att.maxScore) * 100));
        
        setStats({
          totalAttempts: allAttempts.length,
          averageScore: totalMax > 0 ? (totalScore / totalMax) * 100 : 0,
          bestScore: bestPercentage,
          totalQuestions: totalMax
        });
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttempt = (attempt: AttemptWithDetails) => {
    if (!attempt.quiz) return;
    
    // Navigate to results page with the attempt data
    navigate('/quiz', { 
      state: { 
        viewMode: 'review',
        quiz: attempt.quiz,
        attempt: attempt,
        userAnswers: attempt.userAnswers || {} // Use the stored user answers
      }
    });
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-blue-600 bg-blue-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-6 w-6 text-yellow-300 animate-pulse" />
            <span className="text-white/90 font-medium">Your Learning Journey</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Quiz History
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Review your past attempts and track your progress over time
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {attempts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-800 mb-1">
                {stats.totalAttempts}
              </p>
              <p className="text-sm text-slate-600">Total Quizzes</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-800 mb-1">
                {stats.totalQuestions}
              </p>
              <p className="text-sm text-slate-600">Questions Answered</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-800 mb-1">
                {stats.averageScore.toFixed(0)}%
              </p>
              <p className="text-sm text-slate-600">Average Score</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-800 mb-1">
                {stats.bestScore.toFixed(0)}%
              </p>
              <p className="text-sm text-slate-600">Best Score</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History List */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Recent Attempts</CardTitle>
                <p className="text-slate-600 text-sm mt-1">
                  {attempts.length} quiz{attempts.length !== 1 ? 'zes' : ''} completed
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/quiz')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Take New Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {attempts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Quiz History Yet</h3>
              <p className="text-slate-600 mb-6">Take your first quiz to start tracking your progress</p>
              <Button
                onClick={() => navigate('/quiz')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Target className="h-5 w-5 mr-2" />
                Start First Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt) => {
                const percentage = (attempt.score / attempt.maxScore) * 100;
                const gradeColor = getGradeColor(percentage);

                return (
                  <Card
                    key={attempt.id}
                    className="border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${gradeColor}`}>
                              <span className="text-2xl font-bold">
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                {attempt.quiz?.type || 'Quiz'} Quiz
                              </h3>
                              <p className="text-sm text-slate-600 mb-2">
                                {attempt.pdf?.name || 'Unknown Source'}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(attempt.completedAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  <span>{attempt.score}/{attempt.maxScore} correct</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Award className="h-4 w-4" />
                                  <span>{attempt.quiz?.questions.length || 0} questions</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleViewAttempt(attempt)}
                          variant="outline"
                          className="border-2 hover:bg-indigo-50 hover:border-indigo-400 transition-all"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizHistory;