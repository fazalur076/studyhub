import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader, Maximize2, Minimize2 } from 'lucide-react';
import { getPDFById } from '../../services/storage.service';
import { supabase } from '../../services/supabaseClient';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface PDFViewerProps {
  pdfUrl: string;
  onLoadSuccess?: (numPages: number) => void;
}

const PDFViewer = ({ pdfUrl: pdfId, onLoadSuccess }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [actualPdfUrl, setActualPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentPdfIdRef = useRef<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    currentPdfIdRef.current = pdfId;

    const loadPdfUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        const pdf = await getPDFById(pdfId);

        if (cancelled || currentPdfIdRef.current !== pdfId) return;

        if (!pdf) {
          setError('PDF not found');
          setLoading(false);
          return;
        }

        if (!pdf.fileUrl) {
          setError('PDF file URL not available');
          setLoading(false);
          return;
        }

        try {
          const url = pdf.fileUrl;
          const parts = url.split('/');
          const filePath = parts[parts.length - 1];

          const { data, error: dlError } = await supabase.storage
            .from('study-app-pdfs')
            .download(filePath);

          if (cancelled || currentPdfIdRef.current !== pdfId) return;

          if (dlError) {
            setActualPdfUrl(url);
            setLoading(false);
            return;
          }

          const blob = data as Blob;

          if (objectUrlRef.current && objectUrlRef.current !== url) {
            URL.revokeObjectURL(objectUrlRef.current);
          }

          const blobUrl = URL.createObjectURL(blob);
          objectUrlRef.current = blobUrl;

          if (!cancelled && currentPdfIdRef.current === pdfId) {
            setActualPdfUrl(blobUrl);
            setLoading(false);
          } else {
            URL.revokeObjectURL(blobUrl);
          }

        } catch (err) {
          console.error('Error downloading from Supabase:', err);
          if (!cancelled && currentPdfIdRef.current === pdfId) {
            setActualPdfUrl(pdf.fileUrl);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error loading PDF URL:', err);
        if (!cancelled && currentPdfIdRef.current === pdfId) {
          setError('Failed to load PDF');
          setLoading(false);
        }
      }
    };

    if (pdfId) {
      loadPdfUrl();
    }

    return () => {
      cancelled = true;
    };
  }, [pdfId]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
    onLoadSuccess?.(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document');
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative">
            <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <div className="absolute inset-0 h-12 w-12 border-4 border-indigo-200 rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-gray-700 font-semibold">Loading PDF...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (error || !actualPdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl font-bold">!</span>
          </div>
          <h3 className="text-gray-800 font-bold text-xl mb-2">Unable to load PDF</h3>
          <p className="text-gray-600 text-sm">{error || 'PDF URL not available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow-xl flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg h-full'}`}>
      <div className="flex items-center justify-between p-4 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2.5 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-l-lg group"
              title="Previous page"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700 group-hover:text-indigo-600" />
            </button>

            <div className="flex items-center px-3 border-x border-slate-200">
              <input
                type="number"
                min="1"
                max={numPages}
                value={pageNumber}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-12 text-center text-sm font-semibold text-slate-700 bg-transparent focus:outline-none focus:text-indigo-600"
              />
              <span className="text-sm text-slate-500 ml-1">/ {numPages}</span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2.5 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-r-lg group"
              title="Next page"
            >
              <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-indigo-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200">
            <button
              onClick={zoomOut}
              className="p-2.5 hover:bg-indigo-50 transition-all duration-200 rounded-l-lg group"
              title="Zoom out"
            >
              <ZoomOut className="h-5 w-5 text-slate-700 group-hover:text-indigo-600" />
            </button>

            <button
              onClick={resetZoom}
              className="px-4 border-x border-slate-200 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
              title="Reset zoom"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={zoomIn}
              className="p-2.5 hover:bg-indigo-50 transition-all duration-200 rounded-r-lg group"
              title="Zoom in"
            >
              <ZoomIn className="h-5 w-5 text-slate-700 group-hover:text-indigo-600" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-indigo-50 transition-all duration-200 group"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5 text-slate-700 group-hover:text-indigo-600" />
            ) : (
              <Maximize2 className="h-5 w-5 text-slate-700 group-hover:text-indigo-600" />
            )}
          </button>
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto flex justify-center p-6 bg-gradient-to-br from-slate-100 to-slate-200">
        <Document
          file={actualPdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 h-12 w-12 border-4 border-indigo-200 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">Loading PDF...</p>
            </div>
          }
          error={
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl font-bold">!</span>
              </div>
              <p className="text-gray-800 font-semibold text-lg mb-1">Failed to load PDF</p>
              <p className="text-gray-600 text-sm">The PDF file could not be displayed</p>
            </div>
          }
        >
          <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <div className="flex items-center justify-center p-12 bg-white">
                  <Loader className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              }
            />
          </div>
        </Document>
      </div>

      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
        <span>Page {pageNumber} of {numPages}</span>
        <span>Zoom: {Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
};

export default PDFViewer;