import { useState, useRef } from 'react';
import { Upload, X, File, Loader } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface PDFUploadProps {
  onUpload: (file: File) => Promise<void> | void;
  onClose: () => void;
}

const PDFUpload = ({ onUpload, onClose }: PDFUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

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
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        toast.info('Please upload a PDF file');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        toast.info('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || loading) return;
    try {
      setLoading(true);
      await onUpload(selectedFile);
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200 ${loading ? 'opacity-100' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Upload PDF</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground disabled:opacity-50" disabled={loading}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          } ${loading ? 'opacity-90 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <File className="h-12 w-12 text-indigo-600 mx-auto" />
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50" disabled={loading}>
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-slate-400 mx-auto" />
              <div>
                <p className="text-foreground font-medium">
                  Drop your PDF here or{' '}
                  <button onClick={() => fileInputRef.current?.click()} className="text-indigo-600 hover:opacity-90 disabled:opacity-50" disabled={loading}>
                    browse
                  </button>
                </p>
                <p className="text-sm text-muted-foreground mt-1">PDF files up to 50MB</p>
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleChange} className="hidden" disabled={loading} />
        </div>

        {selectedFile && (
          <Button onClick={handleUpload} disabled={loading} className="w-full mt-6 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                Uploading & Processing...
              </span>
            ) : (
              'Upload PDF'
            )}
          </Button>
        )}

        {loading && !selectedFile && (
          <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground">
            <Loader className="h-4 w-4 animate-spin mr-2" /> Preparing upload...
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUpload;
