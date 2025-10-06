import { useState, useEffect } from 'react';
import { TrendingUp, Award, AlertCircle, Brain, Calendar, User, Sparkles } from 'lucide-react';
import { calculateUserProgress } from '../services/storage.service';
import { type UserProgress } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';

const ProfilePage = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Quizzes Taken</span>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">{progress.totalQuizzes}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Average Score</span>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-foreground">{progress.averageScore.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Strong Topics</span>
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-foreground">{progress.strengths.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2 flex-row items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                <CardTitle className="text-xl">Your Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                {progress.strengths.length > 0 ? (
                  <div className="space-y-2">
                    {progress.strengths.map((topic, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                        <span className="font-medium text-foreground">{topic}</span>
                        <span className="text-sm text-green-600 font-semibold">
                          {Math.round((progress.topicScores[topic].correct / progress.topicScores[topic].total) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Take more quizzes to identify your strengths
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2 flex-row items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-xl">Areas to Improve</CardTitle>
              </CardHeader>
              <CardContent>
                {progress.weaknesses.length > 0 ? (
                  <div className="space-y-2">
                    {progress.weaknesses.map((topic, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                        <span className="font-medium text-foreground">{topic}</span>
                        <span className="text-sm text-orange-600 font-semibold">
                          {Math.round((progress.topicScores[topic].correct / progress.topicScores[topic].total) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Great job! No weak areas identified yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Topic Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Topic Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {Object.entries(progress.topicScores).map(([topic, scores]) => {
                const percentage = (scores.correct / scores.total) * 100;
                return (
                  <div key={topic}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{topic}</span>
                      <span className="text-sm text-muted-foreground">
                        {scores.correct}/{scores.total} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Encouragement */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Keep it up!</h4>
                  <p className="text-sm text-slate-700">
                    Consistent practice improves retention. Try a mixed quiz or review your weaker topics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProfilePage;

