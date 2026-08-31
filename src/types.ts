export type StoryGenre = 
  | 'Romance'
  | 'Drama'
  | 'Emotional'
  | 'Tragedy'
  | 'Short Story'
  | "90's Vibes"
  | 'Friendship'
  | 'Mystery'
  | 'Inspirational'
  | 'More Genres';

export type StoryStatus = 'published' | 'pending' | 'draft' | 'rejected';

export type ReaderTheme = 'dark' | 'sepia' | 'light' | 'midnight';

export interface Chapter {
  id: string;
  storyId?: string;
  chapterNumber: number;
  chapterTitle: string;
  content: string;
  wordCount?: number;
  readTime?: string;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  description: string;
  genre: StoryGenre;
  secondaryGenre?: StoryGenre;
  tags: string[];
  coverImage: string;
  pdfUrl?: string;
  pdfStoragePath?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  hasSelectableText?: boolean;
  pageCount?: number;
  extractedText?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  status: StoryStatus;
  visibility?: 'public' | 'private' | 'unlisted';
  rankingScore?: number;
  featured?: boolean;
  chapters: Chapter[];
  rejectionReason?: string;
}

export interface GenreCardInfo {
  id: StoryGenre;
  name: string;
  iconName: string;
  description: string;
  storyCount: number;
  coverImage: string;
}

export interface ReadingProgressItem {
  storyId: string;
  chapterId?: string;
  chapterNumber?: number;
  currentChapter?: number;
  progressPercentage?: number;
  progressPercent?: number;
  lastReadAt?: string;
}

export interface User {
  id: string;
  uid?: string;
  name: string;
  displayName?: string;
  username?: string;
  email: string;
  avatar: string;
  photoURL?: string;
  role: 'admin' | 'author' | 'reader';
  bio?: string;
  penName?: string;
  joinedDate: string;
  accountPrivacy?: 'public' | 'private';
  isPrivate?: boolean;
  followers?: string[];
  following?: string[];
  followRequests?: string[];
  website?: string;
  instagramHandle?: string;
  bookmarks: string[];
  bookmarkedStoryIds: string[];
  likedStoryIds: string[];
  readingHistory: ReadingProgressItem[];
  readingTheme?: ReaderTheme;
  fontSize?: number;
  autoScroll?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowRelation {
  id: string;
  followerId: string;
  followerName?: string;
  followerUsername?: string;
  followerAvatar?: string;
  followingId: string;
  followingName?: string;
  followingUsername?: string;
  followingAvatar?: string;
  status: 'following' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'follow_request' | 'follow_accepted' | 'new_follower' | 'story_like' | 'story_reflection';

export interface StoryReflection {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  userUsername?: string;
  userAvatar?: string;
  userRole?: 'admin' | 'author' | 'reader';
  content: string;
  createdAt: string;
  likes?: number;
  likedBy?: string[];
}

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  actorUsername?: string;
  actorAvatar: string;
  storyId?: string;
  storyTitle?: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

export interface StoryReport {
  id: string;
  storyId: string;
  storyTitle: string;
  reporterEmail: string;
  reason: 'copyright' | 'inappropriate' | 'spam' | 'other';
  details: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read';
}
