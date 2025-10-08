import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Loader, Sparkles, Zap, Target, BookOpen, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import PDFUpload from '../components/pdf/PDFUpload';
import SourceSelector from '../components/pdf/SourceSelector';
import PDFViewer from '../components/pdf/PDFViewer';
import { getAllPDFs, getPDFById, saveQuiz, saveQuizAttempt, savePDF, deletePDF, uploadPDFFile, savePDFText, getPDFText } from '../services/storage.service';
import { extractTextFromPDF, getPDFMetadata } from '../services/pdf.service';
import { generateQuiz } from '../services/openai.service';
import { type PDF } from '../types';
import QuizInterface from '../components/quiz/QuizInterface';
import QuizResults from '../components/quiz/QuizResults';
import ConfirmModal from '../components/ui/confirmModal';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);
  const [quizType, setQuizType] = useState('MCQ');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [previewPdfId, setPreviewPdfId] = useState<string | null>(null);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.viewMode === 'review') {
      setCurrentQuiz(location.state.quiz);
      setQuizAttempt(location.state.attempt);
      setAnswers(location.state.userAnswers || {});
      setShowResults(true);
    }
  }, [location.state]);

  const loadPDFs = async () => {
    const all = await getAllPDFs();
    setPdfs(all);
  };

  useEffect(() => {
    void (async () => {
      await loadPDFs();
      const stored = localStorage.getItem('selectedPDFs');
      if (stored) setSelectedPDFs(JSON.parse(stored));
    })();
  }, []);

  const handleUploadFile = async (file: File) => {
    try {
      const fileUrl = await uploadPDFFile(file);
      const meta = await getPDFMetadata(file);
      const pdfText = await extractTextFromPDF(file);
      const id = uuidv4();
      const newPDF: PDF = {
        id,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        fileUrl: fileUrl,
        size: file.size,
        numPages: meta.numPages || 0,
        totalPages: meta.numPages || 0,
        isSeeded: false,
      };
      await savePDF(newPDF);
      await savePDFText(id, pdfText);
      await loadPDFs();
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF. Please try again.');
    }
  };

  const handleSelectAll = () => {
    if (selectedPDFs.length === pdfs.length) {
      const next: string[] = [];
      setSelectedPDFs(next);
      localStorage.setItem('selectedPDFs', JSON.stringify(next));
    } else {
      const next: string[] = pdfs.map(p => p.id);
      setSelectedPDFs(next);
      localStorage.setItem('selectedPDFs', JSON.stringify(next));
    }
  };

  const handleGenerateQuiz = async () => {
    if (selectedPDFs.length === 0) {
      toast.info('Please select at least one PDF');
      return;
    }

    setLoading(true);

    try {
      const pdfTexts: Array<{ text: string; pdf: PDF }> = [];

      for (const pdfId of selectedPDFs) {
        const pdf = await getPDFById(pdfId);
        if (!pdf) continue;

        let pdfText = await getPDFText(pdfId);

        if (!pdfText) {
          if (!pdf.fileUrl) continue;
          const response = await fetch(pdf.fileUrl);
          const blob = await response.blob();
          const file = new File([blob], pdf.name, { type: 'application/pdf' });
          pdfText = await extractTextFromPDF(file);
          await savePDFText(pdfId, pdfText);
        }

        pdfTexts.push({ text: pdfText, pdf });
      }

      if (pdfTexts.length === 0 || pdfTexts.every(({ text }) => !text.trim())) {
        throw new Error('No text extracted from selected PDFs');
      }

      const validIdSet = new Set(pdfs.map(p => p.id));
      const activeSelected = selectedPDFs.filter(id => validIdSet.has(id));
      if (activeSelected.length === 0) {
        throw new Error('Selected PDFs are no longer available. Please reselect.');
      }

      const questionsPerPDF = Math.max(1, Math.floor(numQuestions / activeSelected.length));
      const remainder = numQuestions % activeSelected.length;

      const allQuestions: any[] = [];

      const pdfTextsFiltered = pdfTexts.filter(({ pdf }) => activeSelected.includes(pdf.id));

      for (let i = 0; i < pdfTextsFiltered.length; i++) {
        const { text: pdfContent, pdf } = pdfTextsFiltered[i];
        const numQ = questionsPerPDF + (i < remainder ? 1 : 0);

        const questions = await generateQuiz({
          pdfContent,
          quizType: quizType as any,
          numQuestions: numQ,
          difficulty: 'medium'
        });

        const grounded = (questions || []).filter(q => {
          const hasText = typeof q?.question === 'string' && q.question.trim().length > 0;
          const hasAnswer = typeof q?.correctAnswer === 'string' && q.correctAnswer.trim().length > 0;
          const hasExplanation = typeof q?.explanation === 'string' && q.explanation.trim().length > 0;
          const mcqOk = q?.type !== 'MCQ' || (Array.isArray(q?.options) && q.options.filter((o: string) => typeof o === 'string' && o.trim()).length >= 3);
          const topicOk = !q?.topic || (q.topic.length <= 40 && !/chapter|contents|index|exercise/i.test(q.topic));
          return hasText && hasAnswer && hasExplanation && mcqOk && topicOk;
        });

        const questionsWithPDFInfo = grounded.map(q => ({
          ...q,
          pdfId: pdf.id,
          pdfName: pdf.name
        }));

        allQuestions.push(...questionsWithPDFInfo);
      }

      if (allQuestions.length === 0) {
        throw new Error('No questions generated from PDFs');
      }

      const newQuiz: any = {
        id: uuidv4(),
        pdfId: activeSelected[0],
        type: quizType as any,
        questions: allQuestions.map(q => ({ ...q, id: uuidv4() })),
        createdAt: new Date()
      };

      await saveQuiz(newQuiz);
      setCurrentQuiz(newQuiz);
      setAnswers({});
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      toast.error(`Failed to generate quiz: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!currentQuiz) return;

    let score = 0;
    const correctAnswers: string[] = [];

    currentQuiz.questions.forEach((question: any) => {
      const userAnswer = answers[question.id]?.toLowerCase().trim();
      const correctAnswer = question.correctAnswer.toLowerCase().trim();

      if (userAnswer === correctAnswer) {
        score++;
        correctAnswers.push(question.id);
      }
    });

    const attempt: any = {
      id: uuidv4(),
      quizId: currentQuiz.id,
      pdfId: currentQuiz.pdfId,
      score,
      maxScore: currentQuiz.questions.length,
      correctAnswers,
      userAnswers: answers,
      completedAt: new Date()
    };

    console.log('Quiz attempt:', attempt);

    await saveQuizAttempt(attempt);

    setQuizAttempt(attempt);
    setShowResults(true);
  };

  const handleDeletePDF = (pdfId: string) => {
    setPdfToDelete(pdfId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pdfToDelete) return;

    try {
      await deletePDF(pdfToDelete);
      const next = selectedPDFs.filter(id => id !== pdfToDelete);
      setSelectedPDFs(next);
      localStorage.setItem('selectedPDFs', JSON.stringify(next));
      await loadPDFs();
    } catch (error) {
      console.error('Error deleting PDF:', error);
      toast.error('Failed to delete PDF. Please try again.');
    } finally {
      setConfirmOpen(false);
      setPdfToDelete(null);
    }
  };



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
          setAnswers({});
          navigate('/quiz', { replace: true });
        }}
      />
    );
  }

  if (currentQuiz && !showResults) {
    return (
      <QuizInterface
        quiz={currentQuiz}
        answers={answers}
        onAnswerChange={setAnswers}
        onSubmit={handleQuizSubmit}
        onCancel={() => {
          setCurrentQuiz(null);
          setAnswers({});
          navigate('/quiz', { replace: true });
        }}
      />
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
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Quiz Configuration</CardTitle>
                <p className="text-slate-600 text-sm mt-1">Customize your learning experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r text-white from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
              <Button variant="outline" size="sm" onClick={handleSelectAll} className="border-2 hover:bg-slate-50">
                {selectedPDFs.length === pdfs.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex items-center flex-col space-y-4 md:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Quiz Configuration</CardTitle>
                <p className="text-slate-600 text-xs mt-1">Customize your learning experience</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r text-white text-xs from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>
              <Button variant="outline" size="xs" onClick={handleSelectAll} className="text-xs border-2 hover:bg-slate-50">
                {selectedPDFs.length === pdfs.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Source Selector */}
          <SourceSelector
            pdfs={pdfs}
            selectedPDFs={selectedPDFs}
            onSelectionChange={setSelectedPDFs}
            onDeletePDF={handleDeletePDF}
            onPreviewPDF={setPreviewPdfId}
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

      {showUpload && (
        <PDFUpload
          onUpload={handleUploadFile}
          onClose={() => setShowUpload(false)}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Delete PDF?"
        description="Are you sure you want to delete this PDF? This will also delete associated quizzes and chats."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {previewPdfId && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4" onClick={() => setPreviewPdfId(null)}>
          <div className="bg-white rounded-xl w-full max-w-5xl h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="font-semibold text-slate-800">Preview</h3>
              <button onClick={() => setPreviewPdfId(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center" aria-label="Close preview">
                <X className="h-5 w-5 text-slate-700" />
              </button>
            </div>
            <div className="h-full">
              <PDFViewer pdfUrl={previewPdfId} />
            </div>
          </div>
        </div>
      )}

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