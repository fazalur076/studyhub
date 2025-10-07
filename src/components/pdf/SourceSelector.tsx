import { Check, BookOpen, Sparkles, Trash } from 'lucide-react';
import { type PDF } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface SourceSelectorProps {
  pdfs: PDF[];
  selectedPDFs: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onDeletePDF?: (pdfId: string) => void;
}

const SourceSelector = ({ pdfs, selectedPDFs, onSelectionChange, onDeletePDF }: SourceSelectorProps) => {
  const handleSelectAll = () => {
    if (selectedPDFs.length === pdfs.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(pdfs.map(p => p.id));
    }
  };

  const handleTogglePDF = (pdfId: string) => {
    if (selectedPDFs.includes(pdfId)) {
      onSelectionChange(selectedPDFs.filter(id => id !== pdfId));
    } else {
      onSelectionChange([...selectedPDFs, pdfId]);
    }
  };

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Select Sources</CardTitle>
              <p className="text-xs text-slate-600">Choose the documents you want to include</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSelectAll} className="border-2 hover:bg-slate-50">
            {selectedPDFs.length === pdfs.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Mobile Layout */}
        <div className="flex items-center flex-col space-y-4 md:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Select Sources</CardTitle>
              <p className="text-xs text-slate-600">Choose the documents you want to include</p>
            </div>
          </div>

          <Button variant="outline" size="xs" onClick={handleSelectAll} className="text-xs border-2 hover:bg-slate-50">
            {selectedPDFs.length === pdfs.length ? 'Deselect All' : 'Select All'}
          </Button>
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
                  className={`relative p-5 rounded-xl border-2 transition-all duration-300 w-full cursor-pointer ${isSelected
                    ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg scale-[1.02]'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01]'
                    }`}
                  onClick={() => handleTogglePDF(pdf.id)}
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
                        {onDeletePDF && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePDF(pdf.id);
                            }}
                            className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center cursor-pointer"
                            title="Delete PDF"
                          >
                            <Trash className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceSelector;