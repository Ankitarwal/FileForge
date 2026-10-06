import React, { useState } from 'react';
import { RotateCw, Trash2, ArrowLeft, ArrowRight, LayoutGrid, Check, CheckSquare } from 'lucide-react';

interface PageItem {
  pageIndex: number;
  rotation: number;
  deleted: boolean;
  selected: boolean;
}

interface PDFPageOrganizerProps {
  totalPages: number;
  fileName: string;
  onApplyChanges: (pages: { pageIndex: number; rotation: number; deleted: boolean }[]) => void;
  onCancel: () => void;
}

export const PDFPageOrganizer: React.FC<PDFPageOrganizerProps> = ({
  totalPages,
  fileName,
  onApplyChanges,
  onCancel,
}) => {
  const [pages, setPages] = useState<PageItem[]>(() =>
    Array.from({ length: totalPages }, (_, i) => ({
      pageIndex: i,
      rotation: 0,
      deleted: false,
      selected: true,
    }))
  );

  const rotatePage = (idx: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const toggleDeletePage = (idx: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, deleted: !p.deleted } : p))
    );
  };

  const movePage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    setPages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      return updated;
    });
  };

  const handleSave = () => {
    onApplyChanges(
      pages.map((p) => ({
        pageIndex: p.pageIndex,
        rotation: p.rotation,
        deleted: p.deleted,
      }))
    );
  };

  const activePageCount = pages.filter((p) => !p.deleted).length;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-card">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
            <span>Visual PDF Page Manager</span>
          </h3>
          <p className="text-xs text-slate-500">
            Reorder, rotate, or delete individual pages for: <span className="font-semibold text-slate-700">{fileName}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {activePageCount} of {totalPages} Pages Kept
          </span>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[460px] overflow-y-auto p-2">
        {pages.map((page, idx) => (
          <div
            key={`page-${page.pageIndex}`}
            className={`relative rounded-2xl p-3 border transition-all flex flex-col items-center justify-between group ${
              page.deleted
                ? 'bg-rose-50/50 border-rose-200 opacity-60'
                : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
            }`}
          >
            {/* Page Number Badge */}
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Page {page.pageIndex + 1}
              </span>
              {page.rotation > 0 && (
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  {page.rotation}°
                </span>
              )}
            </div>

            {/* Thumbnail Box Simulation */}
            <div
              style={{ transform: `rotate(${page.rotation}deg)` }}
              className={`w-28 h-36 rounded-lg border flex flex-col items-center justify-center p-2 shadow-inner my-2 transition-transform duration-200 ${
                page.deleted ? 'bg-rose-100/50 border-rose-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-full h-2 bg-slate-200 rounded mb-1.5" />
              <div className="w-4/5 h-1.5 bg-slate-200 rounded mb-1" />
              <div className="w-full h-1.5 bg-slate-200 rounded mb-1" />
              <div className="w-3/4 h-1.5 bg-slate-200 rounded mb-3" />
              <div className="text-[10px] font-bold text-slate-400">PDF PAGE</div>
              <div className="text-base font-extrabold text-indigo-600">{page.pageIndex + 1}</div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-center space-x-1.5 w-full pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => movePage(idx, idx - 1)}
                disabled={idx === 0}
                className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded hover:bg-slate-100"
                title="Move Page Left"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => rotatePage(idx)}
                className="p-1 text-slate-500 hover:text-amber-600 rounded hover:bg-amber-50"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => movePage(idx, idx + 1)}
                disabled={idx === pages.length - 1}
                className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded hover:bg-slate-100"
                title="Move Page Right"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => toggleDeletePage(idx)}
                className={`p-1 rounded transition-colors ${
                  page.deleted ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-500 hover:bg-rose-50'
                }`}
                title={page.deleted ? 'Restore Page' : 'Delete Page'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={activePageCount === 0}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Save Reorganized PDF ({activePageCount} Pages)</span>
        </button>
      </div>
    </div>
  );
};
