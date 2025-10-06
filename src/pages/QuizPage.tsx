/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RefreshCw, Loader, Sparkles, Zap, Target, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import SourceSelector from '../components/pdf/SourceSelector';
import { getAllPDFs } from '../services/storage.service';
import { type PDF } from '../types';

const QuizInterface = ({ quiz, answers, onAnswerChange, onSubmit, onCancel }) => <div>Quiz Interface</div>;
const QuizResults = ({ quiz, attempt, userAnswers, onNewQuiz }) => <div>Results</div>;

const QuizPage = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);
  const [quizType, setQuizType] = useState('MCQ');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState(null);

  const handleGenerateQuiz = async () => {
    if (selectedPDFs.length === 0) {
      alert('Please select at least one PDF');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Would set currentQuiz here
    }, 2000);
  };
  useEffect(() => {
    void (async () => {
      const all = await getAllPDFs();
      setPdfs(all);
      const stored = localStorage.getItem('selectedPDFs');
      if (stored) setSelectedPDFs(JSON.parse(stored));
    })();
  }, []);


  const quizTypes = [
    { value: 'MCQ', label: 'MCQ', icon: Target, gradient: 'from-blue-500 to-cyan-500' },
    { value: 'SAQ', label: 'SAQ', icon: Zap, gradient: 'from-purple-500 to-pink-500' },
    { value: 'LAQ', label: 'LAQ', icon: BookOpen, gradient: 'from-orange-500 to-red-500' },
    { value: 'MIXED', label: 'Mixed', icon: Sparkles, gradient: 'from-green-500 to-emerald-500' }
  ];

  if (showResults && currentQuiz && quizAttempt) {
    return (
      <QuizResults
        quiz={currentQuiz}
        attempt={quizAttempt}
        userAnswers={answers}
        onNewQuiz={() => {
          setCurrentQuiz(null);
          setShowResults(false);
          setQuizAttempt(null);
        }}
      />
    );
  }

  if (currentQuiz) {
    return (
      <QuizInterface
        quiz={currentQuiz}
        answers={answers}
        onAnswerChange={setAnswers}
        onSubmit={() => setShowResults(true)}
        onCancel={() => setCurrentQuiz(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section - align gradient with HomePage */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6 text-yellow-300 animate-pulse" />
            <span className="text-white/90 font-medium">AI-Powered Assessment</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Generate Your<br />Perfect Quiz
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Test your knowledge with AI-generated questions tailored to your study materials
          </p>
        </div>
      </div>

      {/* Quiz Configuration Card */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r border-b border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Quiz Configuration</CardTitle>
              <p className="text-slate-600 text-sm mt-1">Customize your learning experience</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Source Selector */}
          <SourceSelector
            pdfs={pdfs}
            selectedPDFs={selectedPDFs}
            onSelectionChange={setSelectedPDFs}
          />

          {/* Quiz Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-800">Select Quiz Type</h3>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                Choose One
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quizTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = quizType === type.value;
                return (
                  <Card
                    key={type.value}
                    onClick={() => setQuizType(type.value)}
                    className={`cursor-pointer transition-all duration-300 border-2 ${isSelected
                        ? 'border-indigo-500 shadow-lg scale-105'
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                      }`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-14 h-14 bg-gradient-to-r ${type.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 ${isSelected ? 'scale-110' : ''
                        } transition-transform duration-300`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">{type.label}</h4>
                      <p className="text-xs text-slate-600">
                        {type.value === 'MCQ' && 'Multiple Choice'}
                        {type.value === 'SAQ' && 'Short Answer'}
                        {type.value === 'LAQ' && 'Long Answer'}
                        {type.value === 'MIXED' && 'All Types'}
                      </p>
                      {isSelected && (
                        <div className="mt-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Number of Questions</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-lg px-4 py-1">
                  {numQuestions}
                </Badge>
                <span className="text-slate-600 text-sm">questions</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min="3"
                max="10"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-indigo-600 [&::-webkit-slider-thumb]:to-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:shadow-xl [&::-webkit-slider-thumb]:transition-all"
              />
              <div className="flex justify-between text-sm text-slate-500 mt-2">
                <span>3</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateQuiz}
            disabled={loading || selectedPDFs.length === 0}
            size="lg"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-6 w-6 mr-3" />
                <span className='text-white'>Generating Your Quiz...</span>
              </>
            ) : ( 
              <>
                <Play className="h-6 w-6 mr-3 text-white" />
                <span className='text-white'>Generate Quiz</span>
              </>
            )}
          </Button>

          {selectedPDFs.length === 0 && (
            <p className="text-center text-sm text-slate-500">
              Please select at least one study material to continue
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Pro Tips for Better Results</h4>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>• Select multiple sources for comprehensive coverage</li>
                <li>• Start with MCQ for quick practice, move to LAQ for deeper understanding</li>
                <li>• Mixed quizzes provide the most balanced assessment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPage;