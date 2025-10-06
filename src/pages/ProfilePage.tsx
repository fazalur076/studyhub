import { useState, useEffect } from 'react';
import { TrendingUp, Award, AlertCircle, Brain, Calendar, User, Sparkles, Clock, Target, Trophy, Eye, FileText } from 'lucide-react';
import { calculateUserProgress, getAllAttempts, getQuizById, getPDFById, type QuizAttempt } from '../services/storage.service';
import { type UserProgress, type Quiz, type PDF } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AttemptWithDetails extends QuizAttempt {
  quiz?: Quiz;
  pdf?: PDF;
}

const ProfilePage = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentAttempts, setRecentAttempts] = useState<AttemptWithDetails[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    void loadProgress();
    void loadRecentAttempts();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const userProgress = await calculateUserProgress();
      setProgress(userProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentAttempts = async () => {
    const attempts = await getAllAttempts();
    const sortedAttempts = attempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    const attemptsWithDetails: AttemptWithDetails[] = await Promise.all(
      sortedAttempts.map(async (a) => {
        const quiz = await getQuizById(a.quizId);
        const pdf = quiz ? await getPDFById(quiz.pdfId) : undefined;
        return { ...a, quiz, pdf };
      })
    );
    setRecentAttempts(attemptsWithDetails.slice(0, 5));
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleViewAttempt = (attempt: AttemptWithDetails) => {
    if (!attempt.quiz) return;
    navigate('/quiz', { state: { viewMode: 'review', quiz: attempt.quiz, attempt, userAnswers: attempt.userAnswers || {} } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const stats = {
    totalAttempts: recentAttempts.length,
    totalQuestions: recentAttempts.reduce((sum, a) => sum + a.maxScore, 0),
    averageScore: recentAttempts.length > 0
      ? (recentAttempts.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / recentAttempts.length)
      : 0,
    bestScore: recentAttempts.length > 0
      ? Math.max(...recentAttempts.map(a => (a.score / a.maxScore) * 100))
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl">Your Profile</CardTitle>
              <CardDescription>Insights into your learning journey</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!progress || progress.totalQuizzes === 0 ? (
        <Card className="border-0 shadow-lg text-center mt-14">
          <CardHeader className="pt-12 pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <CardTitle>No Progress Yet</CardTitle>
            <CardDescription>Take your first quiz to start tracking your learning journey!</CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <Button asChild size="lg" className="text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <a href="/quiz">Start Learning</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="group bg-gradient-to-br from-cyan-500 to-blue-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white">
              <CardContent className="p-6">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <p className="text-4xl font-bold mb-1">{stats.totalAttempts}</p>
                <p className="text-sm text-cyan-100">Total Quizzes</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-violet-500 to-fuchsia-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white">
              <CardContent className="p-6">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <p className="text-4xl font-bold mb-1">{stats.totalQuestions}</p>
                <p className="text-sm text-violet-100">Questions Answered</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white">
              <CardContent className="p-6">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="text-4xl font-bold mb-1">{stats.averageScore.toFixed(0)}%</p>
                <p className="text-sm text-emerald-100">Average Score</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-amber-500 to-red-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white">
              <CardContent className="p-6">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <p className="text-4xl font-bold mb-1">{stats.bestScore.toFixed(0)}%</p>
                <p className="text-sm text-amber-100">Best Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Quizzes Taken</span>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800">{progress.totalQuizzes}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Overall Average</span>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800">{progress.averageScore.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Strong Topics</span>
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800">{progress.strengths.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Your Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {progress.strengths.length > 0 ? (
                  <div className="space-y-2">
                    {progress.strengths.map((topic, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:shadow-md transition-all">
                        <span className="font-medium text-slate-800">{topic}</span>
                        <span className="text-sm text-green-600 font-semibold bg-white px-3 py-1 rounded-full">
                          {Math.round((progress.topicScores[topic].correct / progress.topicScores[topic].total) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    Take more quizzes to identify your strengths
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Areas to Improve</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {progress.weaknesses.length > 0 ? (
                  <div className="space-y-2">
                    {progress.weaknesses.map((topic, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 hover:shadow-md transition-all">
                        <span className="font-medium text-slate-800">{topic}</span>
                        <span className="text-sm text-orange-600 font-semibold bg-white px-3 py-1 rounded-full">
                          {Math.round((progress.topicScores[topic].correct / progress.topicScores[topic].total) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    Great job! No weak areas identified yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Topic Performance */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Topic Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {Object.entries(progress.topicScores).map(([topic, scores]) => {
                const percentage = (scores.correct / scores.total) * 100;
                return (
                  <div key={topic}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800">{topic}</span>
                      <span className="text-sm text-slate-600 font-semibold">
                        {scores.correct}/{scores.total} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Encouragement */}
          <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 shadow-xl text-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2">Keep up the amazing work!</h4>
                  <p className="text-white/90">
                    Consistent practice improves retention. Try a mixed quiz or review your weaker topics to keep growing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {recentAttempts.length > 0 && (
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <CardTitle>Recent Attempts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {recentAttempts.map((attempt) => {
              const percentage = (attempt.score / attempt.maxScore) * 100;
              const getGradeColor = (pct: number) => {
                if (pct >= 90) return 'from-green-500 to-emerald-600';
                if (pct >= 80) return 'from-blue-500 to-cyan-600';
                if (pct >= 70) return 'from-yellow-500 to-orange-500';
                return 'from-orange-500 to-red-500';
              };

              return (
                <Card key={attempt.id} className="border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800">{attempt.quiz?.type || 'Quiz'} Quiz</h3>
                        <p className="text-sm text-slate-600 mt-1">{attempt.pdf?.name || 'Unknown Source'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(attempt.completedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getGradeColor(percentage)} text-white font-bold text-center`}>
                          <div className="text-2xl">{percentage.toFixed(0)}%</div>
                          <div className="text-xs opacity-90">{attempt.score}/{attempt.maxScore}</div>
                        </div>
                        <Button onClick={() => handleViewAttempt(attempt)} variant="outline" className="border-2">
                          <Eye className="h-4 w-4 mr-2" /> Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;