import React from 'react';
import { AppNotification } from '../types';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Check,
  X,
  UserPlus,
  UserCheck,
  Heart,
  BookOpen,
  Clock,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  navigate,
}) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    acceptFollowRequest,
    rejectFollowRequest,
  } = useApp();

  if (!isOpen) return null;

  const handleNotificationClick = (item: AppNotification) => {
    markNotificationAsRead(item.id);
    if (item.type === 'follow_request' || item.type === 'new_follower' || item.type === 'follow_accepted') {
      onClose();
      navigate(`profile:${item.actorUsername || item.actorId}`);
    } else if (item.type === 'story_reflection' && item.storyId) {
      onClose();
      navigate(`read:${item.storyId}`);
      setTimeout(() => {
        const el = document.getElementById('comments-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    } else if (item.storyId) {
      onClose();
      navigate(`read:${item.storyId}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 5 }}
        className="absolute right-[-10px] sm:right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-[#0d1424] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0b111e]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-serif-heading text-sm font-bold text-slate-100">
                Notifications
              </h4>
              <p className="text-[10px] text-slate-400">
                {unreadNotificationsCount > 0
                  ? `${unreadNotificationsCount} unread`
                  : 'All caught up'}
              </p>
            </div>
          </div>

          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60 p-1 scrollbar-thin scrollbar-thumb-slate-700">
          {notifications && notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                  !item.read ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-800/60'
                }`}
              >
                {/* Avatar with type badge */}
                <div className="relative shrink-0">
                  <img
                    src={item.actorAvatar}
                    alt={item.actorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700">
                    {item.type === 'follow_request' ? (
                      <Clock className="w-2.5 h-2.5 text-amber-400" />
                    ) : item.type === 'follow_accepted' ? (
                      <UserCheck className="w-2.5 h-2.5 text-emerald-400" />
                    ) : item.type === 'new_follower' ? (
                      <UserPlus className="w-2.5 h-2.5 text-sky-400" />
                    ) : item.type === 'story_reflection' ? (
                      <MessageCircle className="w-2.5 h-2.5 text-amber-400" />
                    ) : (
                      <Heart className="w-2.5 h-2.5 text-rose-400" />
                    )}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 leading-snug">
                    <span className="font-bold text-slate-100">{item.actorName}</span>{' '}
                    {item.actorUsername && (
                      <span className="text-[11px] text-amber-400/80">@{item.actorUsername} </span>
                    )}
                    {item.type === 'follow_request' && 'requested to follow your private stories.'}
                    {item.type === 'follow_accepted' && 'accepted your follow request!'}
                    {item.type === 'new_follower' && 'started following your stories.'}
                    {item.type === 'story_like' &&
                      `liked your story "${item.storyTitle || 'Story'}".`}
                    {item.type === 'story_reflection' && (
                      <span>
                        commented on your story <span className="text-amber-400 font-medium">"{item.storyTitle || 'Story'}"</span>: <span className="text-slate-300 italic">"{item.message}"</span>
                      </span>
                    )}
                  </p>

                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>

                  {/* Direct Actions for Follow Requests */}
                  {item.type === 'follow_request' && (
                    <div
                      className="flex items-center gap-2 mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          acceptFollowRequest(item.actorId);
                          markNotificationAsRead(item.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>Confirm</span>
                      </button>
                      <button
                        onClick={() => {
                          rejectFollowRequest(item.actorId);
                          markNotificationAsRead(item.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all"
                      >
                        <X className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1" />
                )}
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-xs text-slate-400 space-y-1">
              <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="font-medium text-slate-300">No notifications yet</p>
              <p className="text-[11px] text-slate-500">
                You'll receive alerts when members follow you, like your stories, or leave comments.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
