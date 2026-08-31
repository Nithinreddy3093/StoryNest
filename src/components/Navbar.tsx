import React, { useState, useRef, useEffect } from 'react';
import { StoryNestLogo } from './StoryNestLogo';
import { useApp } from '../context/AppContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import {
  Search,
  Upload,
  User as UserIcon,
  Menu,
  X,
  Bookmark,
  BookOpen,
  History,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronDown,
  Bell,
  Settings,
  Users,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const {
    currentUser,
    searchQuery,
    setSearchQuery,
    setShowAuthModal,
    setAuthModalMode,
    logout,
    stories,
    unreadNotificationsCount,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', route: 'home' },
    { name: 'Stories', route: 'stories' },
    { name: 'Genres', route: 'genres' },
    { name: 'Top Reads', route: 'top-reads' },
    { name: 'About', route: 'about' },
    { name: 'Contact', route: 'contact' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      navigate('stories');
      setSearchFocused(false);
    }
  };

  // Live quick search suggestions
  const liveResults = searchInput.trim()
    ? stories
        .filter(
          (s) =>
            s.status === 'published' &&
            (s.title.toLowerCase().includes(searchInput.toLowerCase()) ||
              s.author.toLowerCase().includes(searchInput.toLowerCase()) ||
              s.genre.toLowerCase().includes(searchInput.toLowerCase()) ||
              s.tags.some((t) => t.toLowerCase().includes(searchInput.toLowerCase())))
        )
        .slice(0, 4)
    : [];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070b14]/85 backdrop-blur-xl border-b border-amber-500/10 shadow-lg shadow-black/20 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div onClick={() => navigate('home')} className="cursor-pointer">
          <StoryNestLogo size="md" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => navigate(link.route)}
                className={`relative text-sm font-medium transition-colors py-2 group ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="activeNavUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Area: Search, Notifications, Upload Story, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Global Search Input */}
          <div ref={searchRef} className="relative hidden md:block w-48 lg:w-60">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search stories, authors..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-[#0b111e] text-xs text-slate-200 placeholder-slate-500 pl-3.5 pr-8 py-2 rounded-full border border-slate-700/80 focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Live Search Dropdown */}
            <AnimatePresence>
              {searchFocused && searchInput.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 p-2"
                >
                  {liveResults.length > 0 ? (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Matching Stories
                      </div>
                      {liveResults.map((story) => (
                        <div
                          key={story.id}
                          onClick={() => {
                            navigate(`read:${story.id}`);
                            setSearchFocused(false);
                            setSearchInput('');
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors"
                        >
                          <img
                            src={story.coverImage}
                            alt={story.title}
                            className="w-9 h-9 object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-semibold text-slate-200 truncate">
                              {story.title}
                            </h5>
                            <p className="text-[11px] text-amber-400/80 truncate">
                              {story.author} • {story.genre}
                            </p>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-center text-xs text-amber-400 hover:text-amber-300 font-medium py-1.5 mt-1 border-t border-slate-800"
                      >
                        View all results →
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No stories found for "{searchInput}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload Story Button */}
          <button
            onClick={() => navigate('upload')}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all duration-200 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] min-h-[38px] sm:min-h-[40px]"
            title="Publish a story or PDF"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Upload Story</span>
            <span className="sm:hidden text-xs font-bold">Write</span>
          </button>

          {/* Notifications Bell */}
          {currentUser && (
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                className="relative p-2 sm:p-2.5 rounded-full border border-slate-700/80 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 bg-slate-900/60 transition-all min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <NotificationsDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                navigate={navigate}
              />
            </div>
          )}

          {/* User Profile Dropdown Button */}
          <div ref={dropdownRef} className="relative">
            {currentUser ? (
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 rounded-full border border-slate-700/80 hover:border-amber-500/60 transition-all bg-slate-900/60"
                aria-label="User profile menu"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                  />
                  {currentUser.accountPrivacy === 'private' || currentUser.isPrivate ? (
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full border border-slate-700 text-amber-400">
                      <Lock className="w-2 h-2" />
                    </div>
                  ) : null}
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setShowAuthModal(true);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-700/80 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 bg-slate-900/60 transition-all"
                aria-label="Login"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            )}

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {userDropdownOpen && currentUser && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-[#0d1424] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-slate-200"
                >
                  {/* User info header */}
                  <div
                    onClick={() => {
                      navigate(`profile:${currentUser.username || currentUser.id}`);
                      setUserDropdownOpen(false);
                    }}
                    className="p-3 border-b border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-slate-800/40 rounded-xl transition-colors"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-400/40 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-100 truncate">
                          {currentUser.name}
                        </p>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-400/80 font-mono truncate">
                        @{currentUser.username || currentUser.id}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {currentUser.accountPrivacy === 'private' || currentUser.isPrivate
                          ? '🔒 Private Profile'
                          : '🌐 Public Profile'}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-2 space-y-0.5 text-xs font-medium">
                    <button
                      onClick={() => {
                        navigate(`profile:${currentUser.username || currentUser.id}`);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-amber-300 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Stories</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('profile:requests');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-amber-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>Follow Requests</span>
                      </div>
                      {currentUser.followRequests && currentUser.followRequests.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                          {currentUser.followRequests.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        navigate('profile:bookmarks');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-amber-300 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span>Bookmarked Stories</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('profile:history');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-amber-300 transition-colors"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>Reading History</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('profile:settings');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-amber-300 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Privacy & Account Settings</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          navigate('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/20 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Editorial & Admin Panel</span>
                      </button>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-200 hover:text-white bg-slate-900/90 border border-slate-700/80 flex items-center justify-center min-w-[38px] min-h-[38px] active:scale-95 transition-transform"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-amber-500/10 bg-[#070b14]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search stories, authors, tags..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#0b111e] text-xs text-slate-200 placeholder-slate-500 pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-700/80 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 p-1"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Navigation Links Grid */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Discover
              </div>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const isActive = currentRoute === link.route;
                  return (
                    <button
                      key={link.route}
                      onClick={() => {
                        navigate(link.route);
                        setMobileMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-left text-xs font-semibold border flex items-center justify-between transition-all min-h-[44px] ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && <Sparkles className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Account / Profile Mobile Section */}
            {currentUser ? (
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div
                  onClick={() => {
                    navigate(`profile:${currentUser.username || currentUser.id}`);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-amber-400/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-400/80 font-mono truncate">
                      @{currentUser.username || currentUser.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      navigate(`profile:${currentUser.username || currentUser.id}`);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white min-h-[44px]"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>My Stories</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('profile:bookmarks');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white min-h-[44px]"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bookmarks</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('profile:requests');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white min-h-[44px]"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Requests</span>
                    </div>
                    {currentUser.followRequests && currentUser.followRequests.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                        {currentUser.followRequests.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      navigate('profile:settings');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white min-h-[44px]"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Settings</span>
                  </button>
                </div>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      navigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs min-h-[44px]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Moderation Panel</span>
                  </button>
                )}

                {/* Mobile Logout */}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-950/40 transition-colors min-h-[44px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-center text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 transition-all min-h-[44px]"
                >
                  Log In / Create Account
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
