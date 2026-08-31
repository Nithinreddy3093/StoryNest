import React, { useState } from 'react';
import { User } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Search,
  UserCheck,
  UserPlus,
  Clock,
  Lock,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  userIds: string[];
  navigate: (route: string) => void;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  title,
  userIds,
  navigate,
}) => {
  const {
    currentUser,
    follows,
    getUserByIdOrPenName,
    toggleFollowUser,
    getFollowStatus,
    setShowAuthModal,
    setAuthModalMode,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [loadedUsers, setLoadedUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(false);

  // Load user data for userIds
  React.useEffect(() => {
    if (!isOpen || userIds.length === 0) return;

    let isMounted = true;
    setLoading(true);

    const fetchUsers = async () => {
      const userMap: Record<string, User> = {};
      for (const uid of userIds) {
        const u = await getUserByIdOrPenName(uid);
        if (u && isMounted) {
          userMap[uid] = u;
        } else if (isMounted) {
          // Fallback to embedded metadata inside follows collection
          const followRelation = follows.find(
            (f) => f.followerId === uid || f.followingId === uid
          );
          if (followRelation) {
            const isFollower = followRelation.followerId === uid;
            userMap[uid] = {
              id: uid,
              name: (isFollower ? followRelation.followerName : followRelation.followingName) || 'StoryNest User',
              username: (isFollower ? followRelation.followerUsername : followRelation.followingUsername) || '',
              avatar:
                (isFollower ? followRelation.followerAvatar : followRelation.followingAvatar) ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
              role: 'reader',
              accountPrivacy: 'public',
              email: '',
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              bookmarks: [],
              bookmarkedStoryIds: [],
              likedStoryIds: [],
              readingHistory: [],
            };
          }
        }
      }
      if (isMounted) {
        setLoadedUsers(userMap);
        setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [isOpen, userIds, getUserByIdOrPenName, follows]);

  if (!isOpen) return null;

  const usersList = userIds
    .map((id) => loadedUsers[id])
    .filter(Boolean) as User[];

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.penName && u.penName.toLowerCase().includes(q))
    );
  });

  const handleUserClick = (u: User) => {
    onClose();
    navigate(`profile:${u.username || u.id}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#0b111e] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0d1424]">
            <div className="flex items-center gap-2">
              <h3 className="font-serif-heading text-base font-bold text-slate-100">
                {title}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {userIds.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-slate-800 bg-[#0b111e]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or @username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070b14] text-xs text-slate-200 placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-800/40 scrollbar-thin scrollbar-thumb-slate-700">
            {loading && usersList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading community members...
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const isMe = currentUser?.id === u.id;
                const status = getFollowStatus(u.id);

                return (
                  <div
                    key={u.id}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-900/60 transition-colors"
                  >
                    <div
                      onClick={() => handleUserClick(u)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        {u.accountPrivacy === 'private' || u.isPrivate ? (
                          <div className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full border border-slate-700 text-amber-400">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-200 truncate hover:text-amber-400 transition-colors">
                            {u.name}
                          </p>
                          {u.role === 'author' && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Author
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-amber-400/80 font-mono truncate">
                          @{u.username || u.id}
                        </p>
                        {u.bio && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Follow / Following Action Button */}
                    {!isMe && (
                      <div className="shrink-0">
                        {status === 'following' ? (
                          <button
                            onClick={() => toggleFollowUser(u.id)}
                            className="group flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-700/60 border border-slate-700 text-slate-300 transition-all"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-amber-400 group-hover:hidden" />
                            <span className="group-hover:hidden">Following</span>
                            <span className="hidden group-hover:inline">Unfollow</span>
                          </button>
                        ) : status === 'pending' ? (
                          <button
                            onClick={() => toggleFollowUser(u.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all"
                            title="Click to cancel follow request"
                          >
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            <span>Requested</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleFollowUser(u.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                {searchQuery ? 'No matching users found.' : 'No users in this list yet.'}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
