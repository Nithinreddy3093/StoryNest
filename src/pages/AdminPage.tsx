import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Story, StoryReport } from '../types';
import { DeleteStoryModal } from '../components/DeleteStoryModal';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Star,
  Flag,
  Mail,
  BookOpen,
  Filter,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface AdminPageProps {
  navigate: (route: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
  const {
    currentUser,
    stories,
    updateStoryStatus,
    deleteStory,
    reports,
    resolveReport,
    contacts,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'stories' | 'reports' | 'contacts'>('pending');
  const [rejectReason, setRejectReason] = useState<string>('Does not meet editorial guidelines');
  const [rejectModalStory, setRejectModalStory] = useState<Story | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [isDeletingStory, setIsDeletingStory] = useState(false);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md bg-[#0b111e] p-8 rounded-2xl border border-slate-800">
          <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="font-serif-heading text-xl font-bold">Admin Privileges Required</h2>
          <p className="text-xs text-slate-400">
            You need to be signed in as an Administrator to access the StoryNest moderation and editorial desk.
          </p>
          <button
            onClick={() => navigate('home')}
            className="px-5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const pendingStories = stories.filter((s) => s.status === 'pending');
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const handleApprove = (storyId: string) => {
    updateStoryStatus(storyId, 'published');
    addToast('Story approved and published live!', 'success');
  };

  const handleRejectConfirm = () => {
    if (!rejectModalStory) return;
    updateStoryStatus(rejectModalStory.id, 'rejected', rejectReason);
    setRejectModalStory(null);
    addToast('Story rejected with feedback', 'info');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-slate-100">
              Editorial & Moderation Panel
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Review user submissions, moderate community reports, and manage story publishing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Administrator: {currentUser.name}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'pending', label: 'Review Queue', count: pendingStories.length, icon: <BookOpen className="w-4 h-4" /> },
          { id: 'stories', label: 'All Stories Catalog', count: stories.length, icon: <Filter className="w-4 h-4" /> },
          { id: 'reports', label: 'User Reports', count: pendingReports.length, icon: <Flag className="w-4 h-4" /> },
          { id: 'contacts', label: 'Contact Messages', count: contacts.length, icon: <Mail className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Review Queue (Pending Stories) */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingStories.length > 0 ? (
            pendingStories.map((story) => (
              <div
                key={story.id}
                className="bg-[#0b111e] border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start justify-between gap-6"
              >
                <div className="flex gap-4 w-full md:w-auto">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-24 h-32 object-cover rounded-xl shrink-0 border border-slate-800"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Pending Moderation
                      </span>
                      <span className="text-xs text-slate-400">{story.genre}</span>
                      <span className="text-xs text-slate-500">• {story.language}</span>
                    </div>

                    <h3 className="font-serif-heading text-lg font-bold text-slate-100">
                      {story.title}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium">By {story.author}</p>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      "{story.description}"
                    </p>

                    <div className="text-[11px] text-slate-500">
                      Contains {story.chapters.length} chapter(s) • Submitted on{' '}
                      {new Date(story.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-44 shrink-0">
                  <button
                    onClick={() => navigate(`read:${story.id}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Story</span>
                  </button>

                  <button
                    onClick={() => handleApprove(story.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>

                  <button
                    onClick={() => setRejectModalStory(story)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-[#0b111e]/40 rounded-2xl border border-slate-800 p-8">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-serif-heading text-lg font-bold text-slate-200">
                Moderation Queue is Clean!
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No stories are currently waiting for editorial approval.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: All Stories Catalog */}
      {activeTab === 'stories' && (
        <div className="bg-[#0b111e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070b14] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Cover</th>
                  <th className="p-4">Title & Author</th>
                  <th className="p-4">Genre</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views / Likes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stories.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <img
                        src={s.coverImage}
                        alt={s.title}
                        className="w-10 h-12 object-cover rounded-md border border-slate-800"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-serif font-bold text-slate-100">{s.title}</p>
                      <p className="text-[11px] text-amber-400">{s.author}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {s.genre}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.status === 'published'
                            ? 'bg-emerald-950 text-emerald-300'
                            : s.status === 'pending'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {s.views.toLocaleString()} views • {s.likes} likes
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`read:${s.id}`)}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-amber-400 transition-colors"
                        title="Read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStoryToDelete(s)}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: User Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-[#0b111e] border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800">
                      {report.reason}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      Story: {report.storyTitle}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Reported on {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Details: "{report.details}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`read:${report.storyId}`)}
                    className="px-3 py-1 bg-slate-800 text-slate-200 text-xs font-semibold rounded hover:bg-slate-700"
                  >
                    Inspect Story
                  </button>
                  <button
                    onClick={() => resolveReport(report.id, 'dismissed')}
                    className="px-3 py-1 bg-emerald-800/60 text-emerald-200 text-xs font-semibold rounded hover:bg-emerald-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-[#0b111e]/40 rounded-2xl border border-slate-800 p-8">
              <Flag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="font-serif-heading text-lg font-bold text-slate-200">
                No User Reports
              </h3>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Contact Messages */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-5 rounded-xl bg-[#0b111e] border border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-amber-400">{contact.name}</span>{' '}
                    <span className="text-slate-500">({contact.email})</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(contact.createdAt).toLocaleString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200">Subject: {contact.subject}</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#070b14] p-3 rounded-lg border border-slate-800">
                  {contact.message}
                </p>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-[#0b111e]/40 rounded-2xl border border-slate-800 p-8">
              <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="font-serif-heading text-lg font-bold text-slate-200">
                No Contact Inquiries Yet
              </h3>
            </div>
          )}
        </div>
      )}

      {/* Rejection Feedback Dialog */}
      {rejectModalStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0b111e] border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif-heading text-base font-bold text-slate-100">
              Reject Story: "{rejectModalStory.title}"
            </h3>
            <p className="text-xs text-slate-400">
              Provide feedback for the author explaining why this submission was rejected:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModalStory(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalPublishReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Story Modal */}
      <DeleteStoryModal
        isOpen={!!storyToDelete}
        story={storyToDelete}
        onClose={() => setStoryToDelete(null)}
        onConfirm={async (storyId) => {
          setIsDeletingStory(true);
          try {
            await deleteStory(storyId);
            setStoryToDelete(null);
          } finally {
            setIsDeletingStory(false);
          }
        }}
        isDeleting={isDeletingStory}
      />
    </div>
  );

  function handleFinalPublishReject() {
    handleRejectConfirm();
  }
};
