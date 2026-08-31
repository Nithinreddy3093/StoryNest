import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Story, ReaderTheme } from '../types';
import { StoryCard } from '../components/StoryCard';
import { FollowListModal } from '../components/FollowListModal';
import { DeleteStoryModal } from '../components/DeleteStoryModal';
import { EditAvatarModal } from '../components/EditAvatarModal';
import {
  User as UserIcon,
  BookOpen,
  Bookmark,
  History,
  Settings,
  Shield,
  Eye,
  Heart,
  Plus,
  Trash2,
  Lock,
  Globe,
  Share2,
  UserPlus,
  UserCheck,
  Clock,
  ExternalLink,
  Instagram,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Palette,
  Type,
  Users,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfilePageProps {
  navigate: (route: string) => void;
  subroute?: string; // e.g. 'my-stories', 'bookmarks', 'history', 'settings', 'requests', or a username/userId
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate, subroute }) => {
  const {
    currentUser,
    stories,
    readingProgress,
    deleteStory,
    updateUserProfile,
    deleteAccount,
    toggleFollowUser,
    getFollowStatus,
    getFollowerUserIds,
    getFollowingUserIds,
    getFollowRequestUserIds,
    acceptFollowRequest,
    rejectFollowRequest,
    canViewUserStories,
    getUserByIdOrPenName,
    isUsernameAvailable,
    openShareModal,
    addToast,
    setShowAuthModal,
    setAuthModalMode,
  } = useApp();

  // Target Profile state
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [activeTab, setActiveTab] = useState<'stories' | 'bookmarks' | 'history' | 'requests' | 'settings'>('stories');

  // Follow lists modal state
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalTitle, setFollowModalTitle] = useState('');
  const [followModalUserIds, setFollowModalUserIds] = useState<string[]>([]);

  // Edit form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [website, setWebsite] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [accountPrivacy, setAccountPrivacy] = useState<'public' | 'private'>('public');
  const [readingTheme, setReadingTheme] = useState<ReaderTheme>('dark');
  const [fontSize, setFontSize] = useState<number>(16);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [isDeletingStory, setIsDeletingStory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle direct avatar photo update from modal
  const handleSaveAvatar = async (newAvatarUrl: string) => {
    setAvatar(newAvatarUrl);
    try {
      await updateUserProfile({
        avatar: newAvatarUrl,
        photoURL: newAvatarUrl,
      });
      addToast('Profile picture updated successfully!', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update avatar', 'error');
    }
  };

  // Handle story deletion confirmation
  const handleConfirmDeleteStory = async (storyId: string) => {
    setIsDeletingStory(true);
    try {
      await deleteStory(storyId);
      setStoryToDelete(null);
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete story', 'error');
    } finally {
      setIsDeletingStory(false);
    }
  };

  // Determine if viewing own profile or another user
  const isOwnProfile =
    !subroute ||
    subroute === 'my-stories' ||
    subroute === 'bookmarks' ||
    subroute === 'history' ||
    subroute === 'settings' ||
    subroute === 'requests' ||
    (currentUser && (subroute === currentUser.username || subroute === currentUser.id));

  // Determine active tab or target user from subroute
  useEffect(() => {
    if (subroute === 'my-stories') setActiveTab('stories');
    else if (subroute === 'bookmarks') setActiveTab('bookmarks');
    else if (subroute === 'history') setActiveTab('history');
    else if (subroute === 'settings') setActiveTab('settings');
    else if (subroute === 'requests') setActiveTab('requests');
  }, [subroute]);

  // Load target user profile
  useEffect(() => {
    let isMounted = true;

    if (isOwnProfile) {
      setProfileUser(currentUser);
      if (currentUser) {
        setName(currentUser.name || '');
        setUsername(currentUser.username || '');
        setPenName(currentUser.penName || '');
        setBio(currentUser.bio || '');
        setAvatar(currentUser.avatar || '');
        setWebsite(currentUser.website || '');
        setInstagramHandle(currentUser.instagramHandle || '');
        setAccountPrivacy(
          currentUser.accountPrivacy || (currentUser.isPrivate ? 'private' : 'public')
        );
        setReadingTheme(currentUser.readingTheme || 'dark');
        setFontSize(currentUser.fontSize || 16);
        setAutoScroll(!!currentUser.autoScroll);
      }
    } else {
      setLoadingUser(true);
      const targetQuery = subroute?.startsWith('user:')
        ? subroute.replace('user:', '')
        : subroute?.startsWith('profile:')
        ? subroute.replace('profile:', '')
        : subroute || '';

      getUserByIdOrPenName(targetQuery).then((u) => {
        if (isMounted) {
          setProfileUser(u);
          setLoadingUser(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isOwnProfile, currentUser, subroute, getUserByIdOrPenName]);

  // Save Settings handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);

    const success = await updateUserProfile({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      penName: penName.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
      website: website.trim(),
      instagramHandle: instagramHandle.trim().replace(/^@/, ''),
      accountPrivacy,
      isPrivate: accountPrivacy === 'private',
      readingTheme,
      fontSize,
      autoScroll,
    });

    setIsSaving(false);
    if (success) {
      setActiveTab('stories');
    }
  };

  if (!currentUser && isOwnProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="font-serif-heading text-2xl font-bold text-slate-100 mb-2">
          Sign In to Access Your Profile
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Log in or create a free StoryNest account to publish stories, follow authors, manage reading history, and customize privacy settings.
        </p>
        <button
          onClick={() => {
            setAuthModalMode('login');
            setShowAuthModal(true);
          }}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400 font-medium">Loading profile details...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="font-serif-heading text-2xl font-bold text-slate-100 mb-2">
          User Not Found
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          The requested profile does not exist or may have been updated.
        </p>
        <button
          onClick={() => navigate('stories')}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm"
        >
          Browse Stories
        </button>
      </div>
    );
  }

  // Stories for this user
  const userStories = stories.filter(
    (s) =>
      s.authorId === profileUser.id ||
      s.author.toLowerCase() === profileUser.name.toLowerCase() ||
      (profileUser.penName && s.author.toLowerCase() === profileUser.penName.toLowerCase())
  );

  const publishedUserStories = userStories.filter((s) => s.status === 'published');

  // Bookmarks
  const bookmarkedStoryIds = profileUser.bookmarks || profileUser.bookmarkedStoryIds || [];
  const bookmarkedStories = stories.filter((s) => bookmarkedStoryIds.includes(s.id));

  // History stories
  const historyStoryIds = Object.keys(readingProgress);
  const historyStories = stories.filter((s) => historyStoryIds.includes(s.id));

  // Privacy & Access calculation
  const isProfilePrivate =
    profileUser.accountPrivacy === 'private' ||
    profileUser.isPrivate === true ||
    profileUser.id === 'user-private-1';

  const canAccessContent = canViewUserStories(
    profileUser.id,
    profileUser.accountPrivacy,
    profileUser.isPrivate
  );

  const followStatus = getFollowStatus(profileUser.id);
  const followersList = getFollowerUserIds(profileUser.id);
  const followingList = getFollowingUserIds(profileUser.id);
  const followRequestsList = getFollowRequestUserIds(profileUser.id);

  const openFollowersList = () => {
    setFollowModalTitle(`Followers of ${profileUser.name}`);
    setFollowModalUserIds(followersList);
    setFollowModalOpen(true);
  };

  const openFollowingList = () => {
    setFollowModalTitle(`${profileUser.name} is Following`);
    setFollowModalUserIds(followingList);
    setFollowModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. PROFILE HEADER BANNER */}
      <div className="relative bg-[#0b111e]/90 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 flex-1 min-w-0">
            <div className="relative shrink-0 group">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-amber-500/40 shadow-xl ring-4 ring-black/40"
              />
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity backdrop-blur-xs cursor-pointer shadow-lg"
                  title="Change Profile Picture"
                  aria-label="Change Profile Picture"
                >
                  <Camera className="w-5 h-5 text-amber-400 mb-0.5" />
                  <span>Edit Photo</span>
                </button>
              )}
              {isProfilePrivate ? (
                <div
                  className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 bg-slate-900 rounded-full border border-slate-700 text-amber-400 shadow-md"
                  title="Private Account"
                >
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              ) : (
                <div
                  className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 bg-slate-900 rounded-full border border-slate-700 text-emerald-400 shadow-md"
                  title="Public Account"
                >
                  <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                <h1 className="font-serif-heading text-lg sm:text-2xl font-bold text-slate-100 break-words">
                  {profileUser.name}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  {profileUser.role}
                </span>
                {isProfilePrivate ? (
                  <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    <Lock className="w-2.5 h-2.5 text-amber-400" /> Private
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 shrink-0">
                    <Globe className="w-2.5 h-2.5 text-emerald-400" /> Public
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1 text-xs text-slate-400">
                <span className="font-mono text-amber-400 font-semibold truncate max-w-[200px] sm:max-w-none">
                  @{profileUser.username || profileUser.id}
                </span>
                {profileUser.penName && profileUser.penName !== profileUser.name && (
                  <span className="text-slate-400 truncate max-w-[220px] sm:max-w-none">
                    • Pen Name: <strong className="text-slate-200 font-medium">{profileUser.penName}</strong>
                  </span>
                )}
                {profileUser.joinedDate && (
                  <span className="text-slate-500 hidden sm:inline">• Joined {profileUser.joinedDate}</span>
                )}
              </div>

              {profileUser.bio && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed pt-0.5 break-words">
                  {profileUser.bio}
                </p>
              )}

              {/* Social & Web Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                {profileUser.website && (
                  <a
                    href={
                      profileUser.website.startsWith('http')
                        ? profileUser.website
                        : `https://${profileUser.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span className="truncate">{profileUser.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {profileUser.instagramHandle && (
                  <a
                    href={`https://instagram.com/${profileUser.instagramHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-slate-400 hover:text-pink-400 transition-colors text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-xs"
                  >
                    <Instagram className="w-3.5 h-3.5 shrink-0 text-pink-400" />
                    <span className="truncate">@{profileUser.instagramHandle}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons & Follow Stats */}
          <div className="flex flex-col items-stretch sm:items-center lg:items-end gap-3.5 w-full lg:w-auto shrink-0">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 divide-x divide-slate-800/80 bg-slate-900/80 sm:bg-slate-900/50 border border-slate-800/90 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-center w-full sm:w-80 md:w-88 shadow-inner">
              <div className="flex flex-col items-center justify-center p-1 sm:p-1.5">
                <span className="text-base sm:text-lg font-bold text-slate-100 font-mono leading-none">
                  {publishedUserStories.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1">Stories</span>
              </div>

              <button
                onClick={openFollowersList}
                className="flex flex-col items-center justify-center p-1 sm:p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
              >
                <span className="text-base sm:text-lg font-bold text-slate-100 font-mono leading-none">
                  {followersList.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-400/90 font-medium mt-1 underline underline-offset-2">
                  Followers
                </span>
              </button>

              <button
                onClick={openFollowingList}
                className="flex flex-col items-center justify-center p-1 sm:p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
              >
                <span className="text-base sm:text-lg font-bold text-slate-100 font-mono leading-none">
                  {followingList.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-400/90 font-medium mt-1 underline underline-offset-2">
                  Following
                </span>
              </button>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all min-h-[42px] active:scale-[0.98] shadow-sm"
                  >
                    <Settings className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Settings & Privacy</span>
                  </button>

                  <button
                    onClick={() => openShareModal({ user: profileUser })}
                    className="flex items-center justify-center p-2.5 sm:p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 min-h-[42px] min-w-[42px] active:scale-[0.98] shrink-0"
                    title="Share Profile Link"
                    aria-label="Share Profile Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  {/* Dynamic Follow Button for other profiles */}
                  {followStatus === 'following' ? (
                    <button
                      onClick={() => toggleFollowUser(profileUser.id)}
                      className="group flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-700/80 border border-slate-700 text-slate-200 transition-all min-h-[42px] active:scale-[0.98]"
                    >
                      <UserCheck className="w-4 h-4 text-amber-400 group-hover:hidden shrink-0" />
                      <span className="group-hover:hidden">Following</span>
                      <span className="hidden group-hover:inline">Unfollow</span>
                    </button>
                  ) : followStatus === 'pending' ? (
                    <button
                      onClick={() => toggleFollowUser(profileUser.id)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all min-h-[42px] active:scale-[0.98]"
                      title="Click to cancel follow request"
                    >
                      <Clock className="w-4 h-4 animate-pulse shrink-0" />
                      <span>Requested</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleFollowUser(profileUser.id)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 min-h-[42px] active:scale-[0.98]"
                    >
                      <UserPlus className="w-4 h-4 shrink-0" />
                      <span>Follow</span>
                    </button>
                  )}

                  <button
                    onClick={() => openShareModal({ user: profileUser })}
                    className="flex items-center justify-center p-2.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all min-h-[42px] min-w-[42px] active:scale-[0.98] shrink-0"
                    title="Share Profile Link"
                    aria-label="Share Profile Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. INSTAGRAM-STYLE PRIVATE WALL IF NOT FOLLOWING */}
      {!canAccessContent && !isOwnProfile ? (
        <div className="py-12 sm:py-20 px-4 sm:px-6 text-center bg-[#0b111e]/90 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-slate-100">
            This Account is Private
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Follow @{profileUser.username || profileUser.name} to see their published manuscripts, serialized chapters, and literary updates.
          </p>

          <div className="pt-2">
            {followStatus === 'pending' ? (
              <button
                onClick={() => toggleFollowUser(profileUser.id)}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all min-h-[44px]"
              >
                Follow Request Pending (Click to Cancel)
              </button>
            ) : (
              <button
                onClick={() => toggleFollowUser(profileUser.id)}
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/25 transition-all min-h-[44px]"
              >
                Request to Follow
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 3. FULL ACCESSIBLE PROFILE TABS */
        <div className="space-y-6">
          {/* Navigation Tabs (if viewing own profile) */}
          {isOwnProfile ? (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80 -mx-3 px-3 sm:mx-0 sm:px-0 touch-pan-x">
              {[
                { id: 'stories', label: 'My Stories', icon: <BookOpen className="w-4 h-4 shrink-0" />, count: userStories.length },
                { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4 shrink-0" />, count: bookmarkedStories.length },
                { id: 'history', label: 'Reading History', icon: <History className="w-4 h-4 shrink-0" />, count: historyStories.length },
                {
                  id: 'requests',
                  label: 'Follow Requests',
                  icon: <Users className="w-4 h-4 shrink-0" />,
                  count: followRequestsList.length,
                  highlight: followRequestsList.length > 0,
                },
                { id: 'settings', label: 'Settings & Privacy', icon: <Settings className="w-4 h-4 shrink-0" />, count: null },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] shrink-0 active:scale-[0.97] ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 bg-slate-900/40 border border-slate-800/80 sm:border-0'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count !== null && tab.count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-slate-950 text-amber-400'
                            : tab.highlight
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h3 className="font-serif-heading text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <span>Published Stories by {profileUser.name}</span>
              </h3>
              <span className="text-xs text-slate-400">
                {publishedUserStories.length} {publishedUserStories.length === 1 ? 'story' : 'stories'}
              </span>
            </div>
          )}

          {/* TAB 1: STORIES */}
          {activeTab === 'stories' && (
            <div>
              {userStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {userStories.map((story) => (
                    <div
                      key={story.id}
                      className="bg-[#0b111e] border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden p-3.5 sm:p-4 flex flex-col justify-between gap-3 sm:gap-4 shadow-lg transition-all"
                    >
                      <div className="flex gap-3 sm:gap-3.5 min-w-0">
                        <div className="relative w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-950 shadow-md">
                          <img
                            src={story.coverImage}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30 pointer-events-none"
                          />
                          <img
                            src={story.coverImage}
                            alt={story.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop';
                            }}
                            className="relative z-[1] w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                                story.status === 'published'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : story.status === 'pending'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {story.status}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 truncate font-medium">
                              {story.genre}
                            </span>
                          </div>
                          <h4 className="font-serif-heading text-xs sm:text-sm font-bold text-slate-100 line-clamp-1">
                            {story.title}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {story.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                            <Eye className="w-3.5 h-3.5 text-slate-400" /> {story.views}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                            <Heart className="w-3.5 h-3.5 text-rose-400/80" /> {story.likes}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => openShareModal({ story })}
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-amber-400 bg-slate-900/60 rounded-lg transition-colors"
                            title="Share story link"
                            aria-label="Share story link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`read:${story.id}`)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
                          >
                            Read
                          </button>
                          {isOwnProfile && (
                            <button
                              onClick={() => setStoryToDelete(story)}
                              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 bg-slate-900/60 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                              title="Delete story"
                              aria-label="Delete story"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 sm:py-16 text-center bg-[#0b111e]/40 rounded-2xl sm:rounded-3xl border border-slate-800 p-6 sm:p-8">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-serif-heading text-sm sm:text-base font-bold text-slate-200">
                    No Stories Published Yet
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-5 max-w-sm mx-auto leading-relaxed">
                    {isOwnProfile
                      ? 'Share your first story or manuscript with the StoryNest community.'
                      : 'This author has not published any stories yet.'}
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('upload')}
                      className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 shadow-md shadow-amber-500/20"
                    >
                      Upload Your Story
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BOOKMARKS */}
          {activeTab === 'bookmarks' && isOwnProfile && (
            <div>
              {bookmarkedStories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {bookmarkedStories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onSelectStory={(id) => navigate(`read:${id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 sm:py-16 text-center bg-[#0b111e]/40 rounded-2xl sm:rounded-3xl border border-slate-800 p-6 sm:p-8">
                  <Bookmark className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-serif-heading text-sm sm:text-base font-bold text-slate-200">
                    No Bookmarked Stories
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-5 max-w-sm mx-auto leading-relaxed">
                    Click the bookmark icon on any story to save it for easy access anytime.
                  </p>
                  <button
                    onClick={() => navigate('stories')}
                    className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 shadow-md shadow-amber-500/20"
                  >
                    Discover Stories
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: READING HISTORY */}
          {activeTab === 'history' && isOwnProfile && (
            <div className="space-y-3 sm:space-y-4">
              {historyStories.length > 0 ? (
                historyStories.map((story) => {
                  const progress = readingProgress[story.id];
                  return (
                    <div
                      key={story.id}
                      onClick={() => navigate(`read:${story.id}`)}
                      className="bg-[#0b111e] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4 cursor-pointer transition-all shadow-md"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="relative w-16 sm:w-18 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-950 shadow-sm">
                          <img
                            src={story.coverImage}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30 pointer-events-none"
                          />
                          <img
                            src={story.coverImage}
                            alt={story.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop';
                            }}
                            className="relative z-[1] w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif-heading text-xs sm:text-sm font-bold text-slate-100 truncate">
                            {story.title}
                          </h4>
                          <p className="text-xs text-amber-400 font-medium truncate mt-0.5">By {story.author}</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Chapter {progress?.currentChapter || 1} of {story.chapters.length}
                          </p>
                        </div>
                      </div>

                      {/* Progress Gauge */}
                      <div className="w-full sm:w-56 md:w-64 shrink-0 flex flex-col gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400 text-[11px]">Reading Progress</span>
                          <span className="text-amber-400 text-[11px] font-mono">
                            {progress?.progressPercentage || progress?.progressPercent || 0}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${progress?.progressPercentage || progress?.progressPercent || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 sm:py-16 text-center bg-[#0b111e]/40 rounded-2xl sm:rounded-3xl border border-slate-800 p-6 sm:p-8">
                  <History className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-serif-heading text-sm sm:text-base font-bold text-slate-200">
                    No Reading History Yet
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-5 max-w-sm mx-auto leading-relaxed">
                    Open any story to start tracking your reading chapters automatically.
                  </p>
                  <button
                    onClick={() => navigate('stories')}
                    className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 shadow-md shadow-amber-500/20"
                  >
                    Start Reading Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FOLLOW REQUESTS */}
          {activeTab === 'requests' && isOwnProfile && (
            <div className="max-w-2xl bg-[#0b111e] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-serif-heading text-base sm:text-lg font-bold text-slate-100">
                    Pending Follow Requests
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Approve or decline requests to view your private stories.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {followRequestsList.length}
                </span>
              </div>

              {followRequestsList.length > 0 ? (
                <div className="divide-y divide-slate-800/60">
                  {followRequestsList.map((reqUserId) => (
                    <FollowRequestRow
                      key={reqUserId}
                      userId={reqUserId}
                      onAccept={() => acceptFollowRequest(reqUserId)}
                      onReject={() => rejectFollowRequest(reqUserId)}
                      navigate={navigate}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <Users className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-medium text-slate-300">No pending follow requests.</p>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    When readers ask to follow your private account, you can approve or decline them here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS & PRIVACY */}
          {activeTab === 'settings' && isOwnProfile && (
            <div className="max-w-3xl bg-[#0b111e] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl space-y-6 sm:space-y-8">
              <div>
                <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-slate-100">
                  Profile & Privacy Settings
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your account visibility, handle, author bio, and reading preferences.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* 1. Account Privacy Radio Selector (Instagram-Style) */}
                <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                    <h4 className="font-serif-heading text-sm font-bold text-slate-200">
                      Account Privacy
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Choose who can view your profile, stories, and reading updates.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Public Option */}
                    <div
                      onClick={() => setAccountPrivacy('public')}
                      className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                        accountPrivacy === 'public'
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-[#070b14] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Public Account</span>
                        </div>
                        <input
                          type="radio"
                          name="privacy"
                          checked={accountPrivacy === 'public'}
                          onChange={() => setAccountPrivacy('public')}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Anyone on StoryNest can view your profile, read your stories, and follow you instantly.
                      </p>
                    </div>

                    {/* Private Option */}
                    <div
                      onClick={() => setAccountPrivacy('private')}
                      className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                        accountPrivacy === 'private'
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-[#070b14] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Private Account</span>
                        </div>
                        <input
                          type="radio"
                          name="privacy"
                          checked={accountPrivacy === 'private'}
                          onChange={() => setAccountPrivacy('private')}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Only approved followers can view your stories. Anyone can send a follow request.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Identity & Handle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Username Handle (Unique)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-400">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full bg-[#070b14] border border-slate-700 rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                        placeholder="your_handle"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block truncate">
                      Profile link: storynest.app/#profile/{username || 'username'}
                    </span>
                  </div>
                </div>

                {/* 3. Pen Name & Avatar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Pen Name / Author Alias
                    </label>
                    <input
                      type="text"
                      value={penName}
                      onChange={(e) => setPenName(e.target.value)}
                      placeholder="e.g. Nithin Reddy"
                      className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Profile Picture
                      </label>
                      <button
                        type="button"
                        onClick={() => setAvatarModalOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Upload / Presets</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={avatar.startsWith('data:') ? 'Custom Uploaded Photo' : avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setAvatarModalOpen(true)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-xl border border-slate-700 shrink-0"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Bio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Bio / Author Statement
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the StoryNest community about your reading passions or stories..."
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 leading-relaxed"
                  />
                </div>

                {/* 5. External Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Website / Portfolio
                    </label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://instagram.com/nithinreddy3093"
                      className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Instagram Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                        @
                      </span>
                      <input
                        type="text"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                        placeholder="nithinreddy3093"
                        className="w-full bg-[#070b14] border border-slate-700 rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Reading Preferences Section */}
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400 shrink-0" />
                    <h4 className="font-serif-heading text-sm font-bold text-slate-200">
                      Reading Experience Preferences
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Default Story Reader Theme
                      </label>
                      <select
                        value={readingTheme}
                        onChange={(e) => setReadingTheme(e.target.value as ReaderTheme)}
                        className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="dark">Dark Charcoal (Default)</option>
                        <option value="sepia">Warm Sepia Book</option>
                        <option value="white">Paper White</option>
                        <option value="midnight">Deep Midnight Blue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Default Font Size ({fontSize}px)
                      </label>
                      <input
                        type="range"
                        min={14}
                        max={24}
                        step={2}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>Compact (14px)</span>
                        <span>Normal (16px)</span>
                        <span>Large (24px)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium py-2 text-center sm:text-left transition-colors"
                  >
                    Delete Account
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 min-h-[40px]"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile & Privacy Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 4. MODALS */}
      {/* Followers / Following Modal */}
      <FollowListModal
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        title={followModalTitle}
        userIds={followModalUserIds}
        navigate={navigate}
      />

      {/* Delete Account Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0b111e] border border-rose-800/60 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-700/60 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif-heading text-lg font-bold text-slate-100">
                  Permanently Delete Account?
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  This action is irreversible. All your profile information, reading history, bookmarks, and story data will be permanently removed from StoryNest.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    deleteAccount();
                    navigate('home');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 transition-colors"
                >
                  Yes, Delete My Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Story Confirmation Modal */}
      <DeleteStoryModal
        isOpen={!!storyToDelete}
        story={storyToDelete}
        onClose={() => setStoryToDelete(null)}
        onConfirm={handleConfirmDeleteStory}
        isDeleting={isDeletingStory}
      />

      {/* Edit Avatar & Photo Modal */}
      <EditAvatarModal
        isOpen={avatarModalOpen}
        currentAvatar={avatar || currentUser?.avatar || ''}
        onClose={() => setAvatarModalOpen(false)}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
};

// Sub-component: Follow Request Row with Accept/Reject
const FollowRequestRow: React.FC<{
  userId: string;
  onAccept: () => void;
  onReject: () => void;
  navigate: (route: string) => void;
}> = ({ userId, onAccept, onReject, navigate }) => {
  const { getUserByIdOrPenName, follows } = useApp();
  const [reqUser, setReqUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;
    getUserByIdOrPenName(userId).then((user) => {
      if (!isMounted) return;
      if (user) {
        setReqUser(user);
      } else {
        const rel = follows.find((f) => f.followerId === userId);
        if (rel) {
          setReqUser({
            id: userId,
            name: rel.followerName || 'Community Member',
            username: rel.followerUsername || '',
            avatar:
              rel.followerAvatar ||
              'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
            role: 'reader',
            accountPrivacy: 'public',
            email: '',
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            bookmarks: [],
            bookmarkedStoryIds: [],
            likedStoryIds: [],
            readingHistory: [],
          });
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userId, getUserByIdOrPenName, follows]);

  if (!reqUser) return null;

  return (
    <div className="py-3 flex items-center justify-between gap-3">
      <div
        onClick={() => navigate(`profile:${reqUser.username || reqUser.id}`)}
        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
      >
        <img
          src={reqUser.avatar}
          alt={reqUser.name}
          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-200 truncate hover:text-amber-400 transition-colors">
            {reqUser.name}
          </p>
          <p className="text-[11px] text-amber-400/80 font-mono truncate">
            @{reqUser.username || reqUser.id}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onAccept}
          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Confirm</span>
        </button>
        <button
          onClick={onReject}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
        >
          <X className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
