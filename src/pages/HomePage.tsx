import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, MessageSquare, Sparkles, TrendingUp, BookOpen, ChevronRight, File, Loader, X, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { savePDF, savePDFText, getAllPDFs, deletePDF, uploadPDFFile } from '../services/storage.service';
import { getPDFMetadata, extractTextFromPDF } from '../services/pdf.service';
import { type PDF } from '../types';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '../components/ui/confirmModal';
import { v4 as uuidv4 } from 'uuid';

const HomePage = () => {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState<string | null>(null);

  useEffect(() => {
    void loadPDFs();
    const stored = localStorage.getItem('selectedPDFs');
    if (stored) setSelectedPDFs(JSON.parse(stored));
  }, []);

  const loadPDFs = async () => {
    const all = await getAllPDFs();
    setPdfs(all);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
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

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      console.log('Uploading PDF to Supabase Storage...');
      const fileUrl = await uploadPDFFile(selectedFile);
      console.log('File uploaded successfully:', fileUrl);
      const meta = await getPDFMetadata(selectedFile);
      console.log('Extracting text from PDF...');
      const pdfText = await extractTextFromPDF(selectedFile);
      const id = uuidv4();
      const newPDF: PDF = {
        id,
        name: selectedFile.name,
        uploadedAt: new Date().toISOString(),
        fileUrl: fileUrl,
        size: selectedFile.size,
        numPages: meta.numPages || 0,
        totalPages: meta.numPages || 0,
        isSeeded: false,
      };

      console.log('Saving PDF metadata...');
      await savePDF(newPDF);

      console.log('Saving PDF text...');
      await savePDFText(id, pdfText);

      console.log('PDF uploaded successfully!');

      await loadPDFs();
      setSelectedFile(null);
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const togglePDF = (pdfId: string) => {
    if (selectedPDFs.includes(pdfId)) {
      const next = selectedPDFs.filter(id => id !== pdfId);
      setSelectedPDFs(next);
      localStorage.setItem('selectedPDFs', JSON.stringify(next));
    } else {
      const next = [...selectedPDFs, pdfId];
      setSelectedPDFs(next);
      localStorage.setItem('selectedPDFs', JSON.stringify(next));
    }
  };

  const handleSelectAll = () => {
    if (selectedPDFs.length === pdfs.length) {
      const next: string[] = [];
      setSelectedPDFs(next);
      localStorage.setItem('selectedPDFs', JSON.stringify(next));
    } else {
      const next = pdfs.map(p => p.id);
      setSelectedPDFs(next);
      localStorage.setItem('selectedPDFs', JSON.stringify(next));
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            <span className="text-white/90 font-medium">AI-Powered Learning</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Welcome to<br />StudyHub
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mb-8">
            Transform your study materials into interactive quizzes and get instant help from your AI tutor
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setShowUpload(true)}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Your PDF
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:text-white"
              onClick={() => navigate('/profile')}
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer text-white" onClick={() => navigate('/quiz')}>
            <CardContent className="p-8">
              <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Take Quiz</h3>
              <p className="text-blue-100 mb-4">Test your knowledge with AI-generated questions</p>
              <div className="flex items-center font-semibold group-hover:gap-2 transition-all duration-300">
                Start Now <ChevronRight className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer text-white" onClick={() => navigate('/chat')}>
            <CardContent className="p-8">
              <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Ask AI Tutor</h3>
              <p className="text-purple-100 mb-4">Get instant answers to your questions</p>
              <div className="flex items-center font-semibold group-hover:gap-2 transition-all duration-300">
                Start Chat <ChevronRight className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-pink-500 to-rose-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer text-white" onClick={() => navigate('/profile')}>
            <CardContent className="p-8">
              <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Track Progress</h3>
              <p className="text-pink-100 mb-4">Monitor your learning journey</p>
              <div className="flex items-center font-semibold group-hover:gap-2 transition-all duration-300">
                View Stats <ChevronRight className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF Library */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
          <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Your Library</CardTitle>
                <p className="text-xs text-slate-600">Manage your study materials</p>
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

          <div className="flex items-center flex-col space-y-4 md:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Your Library</CardTitle>
                <p className="text-xs text-slate-600">Manage your study materials</p>
              </div>
            </div>

            <div className="flex items-center justify-center mt-3 gap-2">
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r text-white text-xs from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>
              <Button variant="outline" size="xs" onClick={handleSelectAll} className=" text-xs border-2 hover:bg-slate-50">
                {selectedPDFs.length === pdfs.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>

        </CardHeader>
        <CardContent>
          {pdfs.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium">No PDFs found</p>
              <p className="text-sm text-slate-500">Upload your first coursebook to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {pdfs.map((pdf) => {
                const isSelected = selectedPDFs.includes(pdf.id);
                return (
                  <div
                    key={pdf.id}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 w-full ${isSelected
                      ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg scale-[1.02]'
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01]'
                      }`}
                    onClick={() => togglePDF(pdf.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                          : 'bg-slate-100 hover:bg-slate-200'
                          }`}
                      >
                        <BookOpen className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{pdf.name}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {pdf.isSeeded ? 'NCERT' : 'Uploaded'} • {new Date(pdf.uploadedAt).toLocaleDateString()}
                          {pdf.totalPages ? ` • ${pdf.totalPages} pages` : ''}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2 flex-shrink-0">

                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePDF(pdf.id);
                            }}
                            className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center cursor-pointer"
                            title="Delete PDF"
                          >
                            <Trash className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          {selectedPDFs.length > 0 && (
            <div className="mt-6 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <p className="text-indigo-900 font-semibold">
                {selectedPDFs.length} source{selectedPDFs.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-indigo-700 text-sm mt-1">
                Ready to generate quizzes or start chatting
              </p>
              <div className="mt-3 flex gap-3">
                <Button onClick={() => navigate('/quiz')} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Go to Quiz
                </Button>
                <Button onClick={() => navigate('/chat')} variant="outline" className="border-indigo-300">
                  Go to Chat
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmModal
        open={confirmOpen}
        title="Delete PDF?"
        description="Are you sure you want to delete this PDF? This will also delete associated quizzes and chats."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Upload Modal */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl">Upload PDF</DialogTitle>
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${dragActive
              ? 'border-indigo-500 bg-indigo-50 scale-105'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto">
                  <File className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-800 font-medium text-lg">
                    Drop your PDF here
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    or click to browse
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    PDF files up to 50MB
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
          </div>

          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full text-white mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Uploading & Processing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload PDF
                </>
              )}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>

  );
};

export default HomePage;