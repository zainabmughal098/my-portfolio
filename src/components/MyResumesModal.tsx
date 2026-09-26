import React, { useState } from 'react';
import { useAuth, ResumeListItem } from '../context/AuthContext.tsx';
import { PortfolioData } from '../types/portfolio.ts';
import { BLANK_PORTFOLIO_TEMPLATE } from '../data/presets.ts';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  Clock,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react';

interface MyResumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: PortfolioData;
  onSelectResume: (data: PortfolioData, title: string, id: number) => void;
  onOpenAuthModal: () => void;
}

export const MyResumesModal: React.FC<MyResumesModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onSelectResume,
  onOpenAuthModal,
}) => {
  const {
    user,
    resumesList,
    activeResumeId,
    activeResumeTitle,
    loadResumeById,
    createResumeInCloud,
    renameResumeInCloud,
    deleteResumeFromCloud,
    fetchResumesList,
  } = useAuth();

  // Create new resume form state
  const [isCreating, setIsCreating] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [creationMode, setCreationMode] = useState<'blank' | 'duplicate_current'>('duplicate_current');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Renaming state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Delete confirmation state (inline, completely avoids window.confirm in iframe)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // Loading indicator for switching
  const [switchingId, setSwitchingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const title = newResumeTitle.trim();
      const initialData: PortfolioData =
        creationMode === 'blank'
          ? JSON.parse(JSON.stringify(BLANK_PORTFOLIO_TEMPLATE))
          : JSON.parse(JSON.stringify(currentData));

      // Personalize title in the data if blank
      if (creationMode === 'blank' && initialData.personal) {
        initialData.personal.roleTitle = title;
      }

      const created = await createResumeInCloud(title, initialData);
      if (created) {
        onSelectResume(initialData, created.title, created.id);
        setIsCreating(false);
        setNewResumeTitle('');
        onClose();
      }
    } catch (err) {
      console.error('Failed to create resume:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchResume = async (resume: ResumeListItem) => {
    try {
      setSwitchingId(resume.id);
      const full = await loadResumeById(resume.id);
      if (full) {
        onSelectResume(full.data, full.title, full.id);
        onClose();
      }
    } catch (err) {
      console.error('Failed to switch resume:', err);
    } finally {
      setSwitchingId(null);
    }
  };

  const handleStartRename = (resume: ResumeListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(resume.id);
    setEditingTitle(resume.title);
  };

  const handleSaveRename = async (id: number, e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    await renameResumeInCloud(id, editingTitle.trim());
    setEditingId(null);
  };

  const handlePromptDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDeletingId(id);
      const wasActive = activeResumeId === id;
      const success = await deleteResumeFromCloud(id);

      if (success && wasActive) {
        // Switch to the first remaining resume
        const remaining = resumesList.filter((r) => r.id !== id);
        if (remaining.length > 0) {
          const next = await loadResumeById(remaining[0].id);
          if (next) {
            onSelectResume(next.data, next.title, next.id);
          }
        } else {
          // If no resumes left, load clean canvas
          const blank = JSON.parse(JSON.stringify(BLANK_PORTFOLIO_TEMPLATE));
          onSelectResume(blank, 'My Portfolio Resume', 0);
        }
      }
    } catch (err) {
      console.error('Failed to delete resume:', err);
    } finally {
      setIsDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleDuplicate = async (resume: ResumeListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setSwitchingId(resume.id);
      const full = await loadResumeById(resume.id);
      if (full) {
        const copyTitle = `${full.title} (Copy)`;
        const created = await createResumeInCloud(copyTitle, full.data);
        if (created) {
          await fetchResumesList();
        }
      }
    } catch (err) {
      console.error('Failed to duplicate resume:', err);
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Your Resumes
                {resumesList.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {resumesList.length}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Create and manage multiple targeted resumes for different job roles.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {!user ? (
            <div className="text-center py-10 px-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Sign In to Save Multiple Resumes</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Sign in with Google to create distinct named resumes (e.g., Frontend, Fullstack, Lead UI) that stay safely synced in the cloud.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <span>Sign in with Google</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* "+ Create New Resume" Form / Trigger */}
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <Plus className="w-4 h-4 transition-transform group-hover:scale-120" />
                  <span>Create New Resume with Custom Name</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCreateNew}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-blue-500/30 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Name Your New Resume
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="e.g. Senior Frontend Engineer - Tech ATS"
                      value={newResumeTitle}
                      onChange={(e) => setNewResumeTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="creationMode"
                          checked={creationMode === 'duplicate_current'}
                          onChange={() => setCreationMode('duplicate_current')}
                          className="text-blue-600 focus:ring-0"
                        />
                        <span>Copy current resume details</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="creationMode"
                          checked={creationMode === 'blank'}
                          onChange={() => setCreationMode('blank')}
                          className="text-blue-600 focus:ring-0"
                        />
                        <span>Start from blank template</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !newResumeTitle.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer shrink-0 self-end sm:self-auto"
                    >
                      {isSubmitting ? 'Creating...' : 'Create & Open'}
                    </button>
                  </div>
                </form>
              )}

              {/* List of Resumes */}
              <div className="space-y-2.5 pt-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Saved Resumes ({resumesList.length})
                </div>

                {resumesList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                    No resumes saved yet. Click the button above to create your first named resume!
                  </div>
                ) : (
                  resumesList.map((resItem) => {
                    const isActive = activeResumeId === resItem.id;
                    const isEditingThis = editingId === resItem.id;
                    const isSwitchingThis = switchingId === resItem.id;
                    const isConfirmingDelete = confirmDeleteId === resItem.id;
                    const isDeletingThis = isDeletingId === resItem.id;

                    const formattedDate = new Date(resItem.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    // Inline Delete Confirmation Row
                    if (isConfirmingDelete) {
                      return (
                        <div
                          key={resItem.id}
                          className="p-3.5 sm:p-4 rounded-2xl border border-rose-500/50 bg-rose-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                Delete "{resItem.title}"?
                              </div>
                              <div className="text-[11px] text-rose-300/80">
                                This will permanently remove this resume from your cloud database.
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              disabled={isDeletingThis}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => handleConfirmDelete(resItem.id, e)}
                              disabled={isDeletingThis}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/50 cursor-pointer flex items-center gap-1.5"
                            >
                              {isDeletingThis ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Yes, Delete</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={resItem.id}
                        onClick={() => !isEditingThis && handleSwitchResume(resItem)}
                        className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isActive
                            ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10'
                            : 'bg-slate-950/50 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 group-hover:text-white'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            {isEditingThis ? (
                              <div
                                className="flex items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename(resItem.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                  }}
                                  className="px-2 py-1 bg-slate-900 border border-blue-500 rounded-lg text-white text-xs font-semibold focus:outline-none w-full"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => handleSaveRename(resItem.id, e)}
                                  className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                  title="Save name"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(null);
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-300 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm truncate">
                                  {resItem.title}
                                </span>
                                {isActive && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 font-medium">
                                    Current
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>Updated {formattedDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on right */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Rename */}
                          {!isEditingThis && (
                            <button
                              onClick={(e) => handleStartRename(resItem, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Rename resume"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Duplicate */}
                          <button
                            onClick={(e) => handleDuplicate(resItem, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Duplicate this resume"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => handlePromptDelete(resItem.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete resume"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Switch Button */}
                          <button
                            onClick={() => handleSwitchResume(resItem)}
                            disabled={isActive || isSwitchingThis}
                            className={`ml-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                              isActive
                                ? 'bg-slate-800/60 text-slate-400 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                            }`}
                          >
                            {isSwitchingThis ? (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : isActive ? (
                              <span>Active</span>
                            ) : (
                              <span>Open</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span>All resumes are safely backed up to Serverless PostgreSQL</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
