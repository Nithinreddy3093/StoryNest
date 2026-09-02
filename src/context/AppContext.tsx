import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  OperationType,
  handleFirestoreError,
  FirebaseUser,
} from '../firebase';
import {
  Story,
  User,
  StoryReport,
  ContactSubmission,
  StoryGenre,
  StoryStatus,
  ReadingProgressItem,
  FollowRelation,
  AppNotification,
  StoryReflection,
} from '../types';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // User & Auth
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  authReady: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'signup' | 'forgot') => void;
  authErrorCode: string | null;
  setAuthErrorCode: (code: string | null) => void;
  login: (email: string, password?: string, role?: 'admin' | 'author' | 'reader') => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signup: (name: string, email: string, password?: string, role?: 'author' | 'reader', username?: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  deleteAccount: () => Promise<void>;

  // Social & Follow System
  follows: FollowRelation[];
  toggleFollowUser: (targetUserId: string) => Promise<boolean>;
  getFollowStatus: (targetUserId: string) => 'following' | 'pending' | 'none';
  isFollowingUser: (targetUserId: string) => boolean;
  hasPendingFollowRequest: (targetUserId: string) => boolean;
  getFollowers: (userId: string) => FollowRelation[];
  getFollowerUserIds: (userId: string) => string[];
  getFollowing: (userId: string) => FollowRelation[];
  getFollowingUserIds: (userId: string) => string[];
  getFollowRequests: (userId: string) => FollowRelation[];
  getFollowRequestUserIds: (userId: string) => string[];
  acceptFollowRequest: (requesterId: string) => Promise<void>;
  rejectFollowRequest: (requesterId: string) => Promise<void>;
  canViewUserStories: (authorId: string, authorAccountPrivacy?: string, isAuthorPrivate?: boolean) => boolean;
  getUserByIdOrPenName: (idOrPenName: string) => Promise<User | null>;
  getUserByUsername: (username: string) => Promise<User | null>;
  isUsernameAvailable: (username: string, currentUserId?: string) => Promise<boolean>;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // Share Modal State
  shareModalData: { story?: Story | null; user?: User | null; isOpen: boolean };
  openShareModal: (item: { story?: Story; user?: User }) => void;
  closeShareModal: () => void;

  // Search & Global filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Stories
  stories: Story[];
  storiesLoading: boolean;
  addStory: (story: Story | Partial<Story>) => Promise<Story>;
  updateStoryStatus: (storyId: string, status: StoryStatus, reason?: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;

  // Interactions
  toggleBookmark: (storyId: string) => Promise<boolean>;
  isBookmarked: (storyId: string) => boolean;
  removeBookmark: (storyId: string) => Promise<void>;
  toggleLike: (storyId: string) => Promise<boolean>;
  isLiked: (storyId: string) => boolean;
  recordView: (storyId: string) => Promise<void>;

  // Reader Reflections & Comments
  reflections: StoryReflection[];
  reflectionsLoading: boolean;
  addReflection: (storyId: string, content: string, guestName?: string) => Promise<StoryReflection | null>;
  deleteReflection: (reflectionId: string) => Promise<boolean>;
  toggleLikeReflection: (reflectionId: string) => Promise<boolean>;
  getStoryReflections: (storyId: string) => StoryReflection[];

  // Reading Progress
  readingProgress: Record<string, ReadingProgressItem>;
  updateReadingProgress: (storyId: string, currentChapterOrId: number | string, progressPercentage?: number) => Promise<void>;
  getStoryProgress: (storyId: string) => number;

  // Reports and Moderation
  reports: StoryReport[];
  submitReport: (storyId: string, storyTitle: string, reason: StoryReport['reason'], details: string) => Promise<void>;
  updateReportStatus: (reportId: string, status: StoryReport['status']) => Promise<void>;
  resolveReport: (reportId: string, status: StoryReport['status']) => Promise<void>;

  // Contact
  contacts: ContactSubmission[];
  contactMessages: ContactSubmission[];
  submitContact: (name: string, email: string, subject: string, message: string) => Promise<void>;

  // Toast Notifications
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core collections state - ZERO mock data, purely from Firestore
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [reflections, setReflections] = useState<StoryReflection[]>([]);
  const [reflectionsLoading, setReflectionsLoading] = useState(true);
  const [follows, setFollows] = useState<FollowRelation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reports, setReports] = useState<StoryReport[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactSubmission[]>([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: derive clean username from email or display name
  const generateUsername = (nameOrEmail: string): string => {
    const clean = nameOrEmail
      .toLowerCase()
      .split('@')[0]
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 20);
    return clean.length >= 3 ? clean : `user_${clean || 'member'}_${Math.floor(Math.random() * 1000)}`;
  };

  // 1. Firebase Auth listener - Real users only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setAuthReady(true);

      if (fbUser) {
        setShowAuthModal(false);
        const isAdmin = fbUser.email?.toLowerCase() === 'mudiyamnamitha7@gmail.com';
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (isAdmin) {
            try {
              const adminDocRef = doc(db, 'admins', fbUser.uid);
              await setDoc(
                adminDocRef,
                { email: fbUser.email, role: 'admin', createdAt: new Date().toISOString() },
                { merge: true }
              );
            } catch {
              // Admin record
            }
          }

          if (userSnap.exists()) {
            const data = userSnap.data() as User;
            const finalUser: User = {
              ...data,
              id: fbUser.uid,
              role: isAdmin ? 'admin' : (data.role || 'reader'),
              username: data.username || generateUsername(fbUser.email || fbUser.displayName || 'user'),
              accountPrivacy: data.accountPrivacy || (data.isPrivate ? 'private' : 'public'),
              isPrivate: data.accountPrivacy === 'private' || !!data.isPrivate,
              followers: Array.isArray(data.followers) ? data.followers : [],
              following: Array.isArray(data.following) ? data.following : [],
              followRequests: Array.isArray(data.followRequests) ? data.followRequests : [],
              bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : (Array.isArray(data.bookmarkedStoryIds) ? data.bookmarkedStoryIds : []),
              bookmarkedStoryIds: Array.isArray(data.bookmarkedStoryIds) ? data.bookmarkedStoryIds : (Array.isArray(data.bookmarks) ? data.bookmarks : []),
              likedStoryIds: Array.isArray(data.likedStoryIds) ? data.likedStoryIds : [],
              readingHistory: Array.isArray(data.readingHistory) ? data.readingHistory : [],
              readingTheme: data.readingTheme || 'dark',
              fontSize: data.fontSize || 16,
              autoScroll: !!data.autoScroll,
            };
            setCurrentUser(finalUser);
          } else {
            const generatedUser = generateUsername(fbUser.email || fbUser.displayName || 'user');
            const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'StoryNest User',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'StoryNest User',
              username: generatedUser,
              penName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Author',
              email: fbUser.email || '',
              avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=300&auto=format&fit=crop',
              role: isAdmin ? 'admin' : 'reader',
              bio: '',
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              accountPrivacy: 'public',
              isPrivate: false,
              followers: [],
              following: [],
              followRequests: [],
              bookmarks: [],
              bookmarkedStoryIds: [],
              likedStoryIds: [],
              readingHistory: [],
              readingTheme: 'dark',
              fontSize: 16,
              autoScroll: false,
              createdAt: new Date().toISOString(),
            };
            try {
              await setDoc(userDocRef, newUser);
            } catch (err) {
              console.warn('User creation Firestore note:', err);
            }
            setCurrentUser(newUser);
          }
        } catch {
          setCurrentUser(null);
        }
      } else {
        // No authenticated user -> currentUser is null
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time stories listener from Firestore
  useEffect(() => {
    setStoriesLoading(true);
    const storiesRef = collection(db, 'stories');
    const unsubscribe = onSnapshot(
      storiesRef,
      (snapshot) => {
        const loadedStories: Story[] = [];
        snapshot.forEach((docSnap) => {
          const s = docSnap.data() as Story;
          loadedStories.push({
            ...s,
            id: docSnap.id,
            views: typeof s.views === 'number' ? s.views : 0,
            likes: typeof s.likes === 'number' ? s.likes : 0,
          });
        });
        setStories(loadedStories);
        setStoriesLoading(false);
      },
      (err) => {
        console.warn('Stories listener error:', err);
        setStoriesLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Real-time follows listener from Firestore
  useEffect(() => {
    const followsRef = collection(db, 'follows');
    const unsubscribe = onSnapshot(
      followsRef,
      (snapshot) => {
        const loadedFollows: FollowRelation[] = [];
        snapshot.forEach((docSnap) => {
          loadedFollows.push(docSnap.data() as FollowRelation);
        });
        setFollows(loadedFollows);
      },
      (err) => {
        console.warn('Follows listener note:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // 4. Real-time notifications listener for currentUser
  useEffect(() => {
    if (!currentUser || !auth.currentUser) {
      setNotifications([]);
      return;
    }

    try {
      const notifsRef = collection(db, 'notifications');
      const q = query(notifsRef, where('recipientId', '==', currentUser.id));
      const unsub = onSnapshot(
        q,
        (snap) => {
          const list: AppNotification[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as AppNotification);
          });
          list.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setNotifications(list);
        },
        () => {
          setNotifications([]);
        }
      );
      return () => unsub();
    } catch {
      setNotifications([]);
    }
  }, [currentUser?.id]);

  // 5. Real-time reports listener for Admins
  useEffect(() => {
    if (!authReady || !firebaseUser || currentUser?.role !== 'admin') {
      setReports([]);
      return;
    }

    const reportsRef = collection(db, 'reports');
    const unsubscribe = onSnapshot(
      reportsRef,
      (snapshot) => {
        const loaded: StoryReport[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as StoryReport);
        });
        setReports(loaded);
      },
      () => {
        setReports([]);
      }
    );

    return () => unsubscribe();
  }, [authReady, firebaseUser, currentUser?.role]);

  // 6. Real-time contact messages listener for Admins
  useEffect(() => {
    if (!authReady || !firebaseUser || currentUser?.role !== 'admin') {
      setContactMessages([]);
      return;
    }

    const contactsRef = collection(db, 'contacts');
    const unsubscribe = onSnapshot(
      contactsRef,
      (snapshot) => {
        const loaded: ContactSubmission[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as ContactSubmission);
        });
        setContactMessages(loaded);
      },
      () => {
        setContactMessages([]);
      }
    );

    return () => unsubscribe();
  }, [authReady, firebaseUser, currentUser?.role]);

  // 7. Real-time Reader Reflections listener from Firestore
  useEffect(() => {
    setReflectionsLoading(true);
    const reflectionsRef = collection(db, 'reflections');
    const unsubscribe = onSnapshot(
      reflectionsRef,
      (snapshot) => {
        const loadedReflections: StoryReflection[] = [];
        snapshot.forEach((docSnap) => {
          const r = docSnap.data() as StoryReflection;
          loadedReflections.push({
            ...r,
            id: docSnap.id,
            likes: typeof r.likes === 'number' ? r.likes : 0,
            likedBy: Array.isArray(r.likedBy) ? r.likedBy : [],
          });
        });
        // Sort newest first
        loadedReflections.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setReflections(loadedReflections);
        setReflectionsLoading(false);
      },
      (err) => {
        console.warn('Reflections listener notice:', err);
        setReflectionsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Auth Methods
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      addToast(`Welcome to StoryNest, ${user.displayName || 'Friend'}!`, 'success');
      setShowAuthModal(false);
      return true;
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        const currentHostname = window.location.hostname;
        addToast(
          `Domain "${currentHostname}" is not authorized in Firebase. Please add "${currentHostname}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`,
          'error'
        );
      } else if (error?.code === 'auth/popup-closed-by-user') {
        addToast('Sign-in cancelled.', 'info');
      } else if (error?.code === 'auth/popup-blocked') {
        addToast('Sign-in popup was blocked by your browser. Please allow popups for this site.', 'warning');
      } else {
        addToast(error.message || 'Google Sign-in failed. Please try again.', 'error');
      }
      return false;
    }
  };

  const login = async (
    email: string,
    password?: string,
    _role: 'admin' | 'author' | 'reader' = 'reader'
  ): Promise<boolean> => {
    setAuthErrorCode(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      addToast('Please enter your email address.', 'warning');
      return false;
    }
    if (!password) {
      addToast('Please enter your password.', 'warning');
      return false;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;
      const isAdmin = fbUser.email?.toLowerCase() === 'mudiyamnamitha7@gmail.com';
      const userDocRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data() as User;
        const finalUser: User = {
          ...data,
          id: fbUser.uid,
          role: isAdmin ? 'admin' : (data.role || 'reader'),
        };
        setCurrentUser(finalUser);
        addToast(`Welcome back, ${finalUser.name || finalUser.displayName || 'Reader'}!`, 'success');
      } else {
        const generatedUser = generateUsername(fbUser.email || fbUser.displayName || 'user');
        const newUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'StoryNest User',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'StoryNest User',
          username: generatedUser,
          penName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Author',
          email: fbUser.email || cleanEmail,
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=300&auto=format&fit=crop',
          role: isAdmin ? 'admin' : 'reader',
          bio: '',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          accountPrivacy: 'public',
          isPrivate: false,
          followers: [],
          following: [],
          followRequests: [],
          bookmarks: [],
          bookmarkedStoryIds: [],
          likedStoryIds: [],
          readingHistory: [],
          readingTheme: 'dark',
          fontSize: 16,
          autoScroll: false,
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, newUser);
          setCurrentUser(newUser);
        } catch (setErr) {
          console.warn('User profile creation note:', setErr);
          setCurrentUser(newUser);
        }
        addToast(`Welcome back to StoryNest, ${newUser.name}!`, 'success');
      }

      setShowAuthModal(false);
      return true;
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      const errorCode = error?.code || '';
      setAuthErrorCode(errorCode);
      if (
        errorCode === 'auth/user-not-found' ||
        errorCode === 'auth/wrong-password' ||
        errorCode === 'auth/invalid-credential'
      ) {
        addToast('Invalid email or password. Please verify your credentials or create an account.', 'error');
      } else if (errorCode === 'auth/invalid-email') {
        addToast('Please enter a valid email address.', 'error');
      } else if (errorCode === 'auth/user-disabled') {
        addToast('This account has been disabled. Please contact support.', 'error');
      } else if (errorCode === 'auth/too-many-requests') {
        addToast('Too many failed attempts. Please wait a moment or reset your password.', 'error');
      } else if (errorCode === 'auth/operation-not-allowed') {
        addToast('Email & Password sign-in is not enabled in Firebase Console. Please use Google Sign-in or enable Email/Password provider in Firebase Console.', 'warning');
      } else {
        addToast(error.message || 'Failed to sign in. Please try again.', 'error');
      }
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password?: string,
    role: 'author' | 'reader' = 'reader',
    customUsername?: string
  ): Promise<boolean> => {
    setAuthErrorCode(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail) {
      addToast('Please enter your email address.', 'warning');
      return false;
    }
    if (!password || password.length < 6) {
      addToast('Password must be at least 6 characters long.', 'warning');
      return false;
    }

    const cleanUsername = customUsername
      ? customUsername.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_')
      : generateUsername(cleanName || cleanEmail);

    const available = await isUsernameAvailable(cleanUsername);
    if (!available) {
      addToast(`Username @${cleanUsername} is already taken. Please choose another name or username.`, 'error');
      return false;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;

      if (cleanName) {
        try {
          await updateProfile(fbUser, { displayName: cleanName });
        } catch (pErr) {
          console.warn('Update profile note:', pErr);
        }
      }

      const isAdmin = cleanEmail === 'mudiyamnamitha7@gmail.com';
      const newUser: User = {
        id: fbUser.uid,
        name: cleanName || cleanEmail.split('@')[0],
        displayName: cleanName || cleanEmail.split('@')[0],
        username: cleanUsername,
        penName: cleanName || 'Author',
        email: cleanEmail,
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=300&auto=format&fit=crop',
        role: isAdmin ? 'admin' : role,
        bio: '',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        accountPrivacy: 'public',
        isPrivate: false,
        followers: [],
        following: [],
        followRequests: [],
        bookmarks: [],
        bookmarkedStoryIds: [],
        likedStoryIds: [],
        readingHistory: [],
        readingTheme: 'dark',
        fontSize: 16,
        autoScroll: false,
        createdAt: new Date().toISOString(),
      };

      const userDocRef = doc(db, 'users', fbUser.uid);
      await setDoc(userDocRef, newUser);

      if (isAdmin) {
        try {
          const adminDocRef = doc(db, 'admins', fbUser.uid);
          await setDoc(
            adminDocRef,
            { email: cleanEmail, role: 'admin', createdAt: new Date().toISOString() },
            { merge: true }
          );
        } catch {
          // admin doc
        }
      }

      setCurrentUser(newUser);
      setShowAuthModal(false);
      addToast(`Account created! Welcome to StoryNest, @${newUser.username}.`, 'success');
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorCode = error?.code || '';
      setAuthErrorCode(errorCode);

      if (errorCode === 'auth/email-already-in-use') {
        // If email already in use, attempt automatic sign in with the provided password
        if (password) {
          try {
            const loginOk = await login(cleanEmail, password);
            if (loginOk) {
              addToast('Signed in with your existing account.', 'success');
              return true;
            }
          } catch {
            // fall through to warning toast
          }
        }
        addToast('An account with this email already exists. Please sign in instead.', 'warning');
      } else if (errorCode === 'auth/invalid-email') {
        addToast('Please enter a valid email address.', 'error');
      } else if (errorCode === 'auth/weak-password') {
        addToast('Password is too weak. Please use at least 6 characters.', 'warning');
      } else if (errorCode === 'auth/operation-not-allowed') {
        addToast('Email & Password registration is not enabled in Firebase Console. Please use Google Sign-in or enable Email/Password provider.', 'warning');
      } else {
        addToast(error.message || 'Could not create account. Please try again.', 'error');
      }
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      addToast('Please enter your email address to reset password.', 'warning');
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      addToast(`Password reset link sent to ${cleanEmail}. Check your inbox!`, 'success');
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      const errorCode = error?.code || '';
      if (errorCode === 'auth/user-not-found') {
        addToast(`If an account exists for ${cleanEmail}, a reset email has been sent.`, 'info');
        return true;
      } else if (errorCode === 'auth/invalid-email') {
        addToast('Please provide a valid email address.', 'error');
      } else if (errorCode === 'auth/operation-not-allowed') {
        addToast('Email password reset is not enabled in Firebase.', 'error');
      } else {
        addToast(error.message || 'Could not send password reset email.', 'error');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
    } catch (e) {
      console.warn('Firebase logout note:', e);
    }
    setCurrentUser(null);
    addToast('You have been signed out.', 'info');
  };

  // Share Modal State
  const [shareModalData, setShareModalData] = useState<{
    story?: Story | null;
    user?: User | null;
    isOpen: boolean;
  }>({
    story: null,
    user: null,
    isOpen: false,
  });

  const openShareModal = (item: { story?: Story; user?: User }) => {
    setShareModalData({
      story: item.story || null,
      user: item.user || null,
      isOpen: true,
    });
  };

  const closeShareModal = () => {
    setShareModalData((prev) => ({ ...prev, isOpen: false }));
  };

  // Check username uniqueness in Firestore
  const isUsernameAvailable = async (
    username: string,
    currentUserId?: string
  ): Promise<boolean> => {
    const clean = username.toLowerCase().trim();
    if (!/^[a-z0-9_]{3,30}$/.test(clean)) return false;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const found = snap.docs.find((d) => d.id !== currentUserId);
        if (found) return false;
      }
    } catch {
      // Offline fallback
    }

    return true;
  };

  // Update profile
  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;

    if (data.username && data.username.toLowerCase() !== currentUser.username?.toLowerCase()) {
      const cleanUsername = data.username.toLowerCase().trim();
      if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
        addToast(
          'Username must be 3-30 characters with letters, numbers, or underscores only.',
          'error'
        );
        return false;
      }

      const available = await isUsernameAvailable(cleanUsername, currentUser.id);
      if (!available) {
        addToast(`@${cleanUsername} is already taken. Please choose another username.`, 'error');
        return false;
      }
      data.username = cleanUsername;
    }

    if (data.accountPrivacy !== undefined) {
      data.isPrivate = data.accountPrivacy === 'private';
    } else if (data.isPrivate !== undefined) {
      data.accountPrivacy = data.isPrivate ? 'private' : 'public';
    }

    const updated: User = {
      ...currentUser,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updated);

    const cleanData: Record<string, any> = {};
    Object.entries(updated).forEach(([k, v]) => {
      if (v !== undefined) cleanData[k] = v;
    });

    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, cleanData);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }

    addToast('Profile updated.', 'success');
    return true;
  };

  // Account deletion
  const deleteAccount = async () => {
    if (!currentUser) return;
    const uid = currentUser.id;

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.warn('Delete account error:', e);
      }
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn('Signout after delete error:', e);
      }
    }

    setCurrentUser(null);
    addToast('Your StoryNest account has been permanently deleted.', 'info');
  };

  // Social & Follow System (Single Source of Truth: Firestore 'follows' collection)
  const getFollowers = (userId: string): FollowRelation[] => {
    if (!userId) return [];
    return follows.filter((f) => f.followingId === userId && f.status === 'following');
  };

  const getFollowerUserIds = (userId: string): string[] => {
    return getFollowers(userId).map((f) => f.followerId);
  };

  const getFollowing = (userId: string): FollowRelation[] => {
    if (!userId) return [];
    return follows.filter((f) => f.followerId === userId && f.status === 'following');
  };

  const getFollowingUserIds = (userId: string): string[] => {
    return getFollowing(userId).map((f) => f.followingId);
  };

  const getFollowRequests = (userId: string): FollowRelation[] => {
    if (!userId) return [];
    return follows.filter((f) => f.followingId === userId && f.status === 'pending');
  };

  const getFollowRequestUserIds = (userId: string): string[] => {
    return getFollowRequests(userId).map((f) => f.followerId);
  };

  const getFollowStatus = (targetUserIdOrHandle: string): 'following' | 'pending' | 'none' => {
    if (!currentUser || !targetUserIdOrHandle) return 'none';
    if (currentUser.id === targetUserIdOrHandle) return 'none';

    // 1. Direct match on followerId == currentUser.id and followingId == targetUserId
    const match = follows.find(
      (f) =>
        f.followerId === currentUser.id &&
        (f.followingId === targetUserIdOrHandle ||
          (f.followingUsername && f.followingUsername.toLowerCase() === targetUserIdOrHandle.toLowerCase()))
    );

    if (match) {
      if (match.status === 'following') return 'following';
      if (match.status === 'pending') return 'pending';
    }

    return 'none';
  };

  const isFollowingUser = (targetUserId: string): boolean => {
    return getFollowStatus(targetUserId) === 'following';
  };

  const hasPendingFollowRequest = (targetUserId: string): boolean => {
    return getFollowStatus(targetUserId) === 'pending';
  };

  const canViewUserStories = (
    authorId: string,
    authorAccountPrivacy?: string,
    isAuthorPrivate?: boolean
  ): boolean => {
    const isPrivate =
      authorAccountPrivacy === 'private' || isAuthorPrivate === true;

    if (!isPrivate) return true;

    if (currentUser && (currentUser.id === authorId || currentUser.uid === authorId)) {
      return true;
    }

    if (currentUser?.role === 'admin') {
      return true;
    }

    if (currentUser && isFollowingUser(authorId)) {
      return true;
    }

    return false;
  };

  const toggleFollowUser = async (targetUserIdOrHandle: string): Promise<boolean> => {
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthModalMode('login');
      addToast('Please sign in to follow authors.', 'warning');
      return false;
    }

    // Resolve target user by ID, username, or penName to guarantee we use the true Firestore Auth UID
    const targetUser = await getUserByIdOrPenName(targetUserIdOrHandle);
    if (!targetUser || !targetUser.id) {
      addToast('Author not found.', 'error');
      return false;
    }

    const actualTargetUid = targetUser.id;
    const actualCurrentUid = currentUser.id;

    if (actualCurrentUid === actualTargetUid) {
      addToast('You cannot follow your own profile.', 'info');
      return false;
    }

    const currentStatus = getFollowStatus(actualTargetUid);
    const followDocId = `${actualCurrentUid}_${actualTargetUid}`;
    const isTargetPrivate =
      targetUser.accountPrivacy === 'private' || targetUser.isPrivate === true;

    // CASE 1: Currently Following -> Unfollow
    if (currentStatus === 'following') {
      setFollows((prev) => prev.filter((f) => f.id !== followDocId));

      try {
        await deleteDoc(doc(db, 'follows', followDocId));
      } catch (e) {
        console.warn('Firestore unfollow error:', e);
      }

      addToast(`Unfollowed @${targetUser.username || targetUser.name || 'author'}.`, 'info');
      return false;
    }

    // CASE 2: Currently Pending Request -> Cancel Request
    if (currentStatus === 'pending') {
      setFollows((prev) => prev.filter((f) => f.id !== followDocId));

      try {
        await deleteDoc(doc(db, 'follows', followDocId));
      } catch (e) {
        console.warn('Firestore cancel request error:', e);
      }

      addToast('Follow request cancelled.', 'info');
      return false;
    }

    // CASE 3: Not Following, Target is PRIVATE -> Send Follow Request
    if (isTargetPrivate) {
      const newFollowDoc: FollowRelation = {
        id: followDocId,
        followerId: actualCurrentUid,
        followerName: currentUser.name || currentUser.displayName || 'Reader',
        followerUsername: currentUser.username || '',
        followerAvatar: currentUser.avatar || '',
        followingId: actualTargetUid,
        followingName: targetUser.name || targetUser.displayName || 'Author',
        followingUsername: targetUser.username || '',
        followingAvatar: targetUser.avatar || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setFollows((prev) => [...prev.filter((f) => f.id !== followDocId), newFollowDoc]);

      const newNotif: AppNotification = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        recipientId: actualTargetUid,
        type: 'follow_request',
        actorId: actualCurrentUid,
        actorName: currentUser.name || 'Reader',
        actorUsername: currentUser.username || '',
        actorAvatar: currentUser.avatar || '',
        read: false,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'follows', followDocId), newFollowDoc);
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      } catch (err) {
        console.warn('Follow request write note:', err);
      }

      addToast(
        `Follow request sent to @${targetUser.username || targetUser.name || 'author'}.`,
        'success'
      );
      return false;
    }

    // CASE 4: Not Following, Target is PUBLIC -> Follow Immediately
    const newFollowDoc: FollowRelation = {
      id: followDocId,
      followerId: actualCurrentUid,
      followerName: currentUser.name || currentUser.displayName || 'Reader',
      followerUsername: currentUser.username || '',
      followerAvatar: currentUser.avatar || '',
      followingId: actualTargetUid,
      followingName: targetUser.name || targetUser.displayName || 'Author',
      followingUsername: targetUser.username || '',
      followingAvatar: targetUser.avatar || '',
      status: 'following',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFollows((prev) => [...prev.filter((f) => f.id !== followDocId), newFollowDoc]);

    const newNotif: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      recipientId: actualTargetUid,
      type: 'new_follower',
      actorId: actualCurrentUid,
      actorName: currentUser.name || 'Reader',
      actorUsername: currentUser.username || '',
      actorAvatar: currentUser.avatar || '',
      read: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'follows', followDocId), newFollowDoc);
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (err) {
      console.warn('Follow document write note:', err);
    }

    addToast(
      `Now following @${targetUser.username || targetUser.name || 'author'}!`,
      'success'
    );
    return true;
  };

  const acceptFollowRequest = async (requesterId: string) => {
    if (!currentUser) return;

    const followDocId = `${requesterId}_${currentUser.id}`;

    setFollows((prev) =>
      prev.map((f) =>
        f.id === followDocId
          ? { ...f, status: 'following', updatedAt: new Date().toISOString() }
          : f
      )
    );

    const requester = await getUserByIdOrPenName(requesterId);

    const newNotif: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      recipientId: requesterId,
      type: 'follow_accepted',
      actorId: currentUser.id,
      actorName: currentUser.name || 'Author',
      actorUsername: currentUser.username || '',
      actorAvatar: currentUser.avatar || '',
      read: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'follows', followDocId), {
        status: 'following',
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (err) {
      console.warn('Accept follow error:', err);
    }

    addToast(
      `Accepted follow request from @${requester?.username || requester?.name || 'user'}.`,
      'success'
    );
  };

  const rejectFollowRequest = async (requesterId: string) => {
    if (!currentUser) return;

    const followDocId = `${requesterId}_${currentUser.id}`;

    setFollows((prev) => prev.filter((f) => f.id !== followDocId));

    try {
      await deleteDoc(doc(db, 'follows', followDocId));
    } catch (err) {
      console.warn('Reject follow error:', err);
    }

    addToast('Follow request removed.', 'info');
  };

  // Real User Lookup only from Firestore
  const getUserByIdOrPenName = async (idOrPenName: string): Promise<User | null> => {
    if (!idOrPenName) return null;
    const cleanId = decodeURIComponent(idOrPenName).trim();

    // 1. Current logged in user
    if (
      currentUser &&
      (currentUser.id === cleanId ||
        currentUser.username?.toLowerCase() === cleanId.toLowerCase() ||
        currentUser.penName?.toLowerCase() === cleanId.toLowerCase() ||
        currentUser.name.toLowerCase() === cleanId.toLowerCase())
    ) {
      return currentUser;
    }

    // 2. Query Firestore users by ID
    try {
      const docRef = doc(db, 'users', cleanId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch {
      // Continue
    }

    // 3. Query Firestore users by username
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', cleanId.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as User;
      }
    } catch {
      // Continue
    }

    // 4. Query Firestore users by penName
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('penName', '==', cleanId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as User;
      }
    } catch {
      // Continue
    }

    return null;
  };

  const getUserByUsername = async (username: string): Promise<User | null> => {
    return getUserByIdOrPenName(username);
  };

  // Notifications Helpers
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch {
        // offline
      }
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (auth.currentUser) {
      try {
        const batch = writeBatch(db);
        notifications
          .filter((n) => !n.read)
          .forEach((n) => {
            batch.update(doc(db, 'notifications', n.id), { read: true });
          });
        await batch.commit();
      } catch {
        // offline
      }
    }
    addToast('All notifications marked as read.', 'info');
  };

  // Interactions
  const toggleBookmark = async (storyId: string): Promise<boolean> => {
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthModalMode('login');
      addToast('Please log in to bookmark stories.', 'warning');
      return false;
    }

    const currentList = currentUser.bookmarks || currentUser.bookmarkedStoryIds || [];
    const isAlreadyBookmarked = currentList.includes(storyId);
    const updatedBookmarks = isAlreadyBookmarked
      ? currentList.filter((id) => id !== storyId)
      : [...currentList, storyId];

    const updatedUser = {
      ...currentUser,
      bookmarks: updatedBookmarks,
      bookmarkedStoryIds: updatedBookmarks,
    };
    setCurrentUser(updatedUser);

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          bookmarks: updatedBookmarks,
          bookmarkedStoryIds: updatedBookmarks,
        });
      } catch (error) {
        console.warn('Firestore bookmark note:', error);
      }
    }

    if (isAlreadyBookmarked) {
      addToast('Removed from your bookmarks.', 'info');
    } else {
      addToast('Story bookmarked to your library!', 'success');
    }
    return !isAlreadyBookmarked;
  };

  const isBookmarked = (storyId: string): boolean => {
    if (!currentUser) return false;
    const currentList = currentUser.bookmarks || currentUser.bookmarkedStoryIds || [];
    return currentList.includes(storyId);
  };

  const removeBookmark = async (storyId: string) => {
    if (!currentUser) return;
    const currentList = currentUser.bookmarks || currentUser.bookmarkedStoryIds || [];
    const updated = currentList.filter((id) => id !== storyId);
    const updatedUser = {
      ...currentUser,
      bookmarks: updated,
      bookmarkedStoryIds: updated,
    };
    setCurrentUser(updatedUser);

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          bookmarks: updated,
          bookmarkedStoryIds: updated,
        });
      } catch (error) {
        console.warn('Firestore removeBookmark note:', error);
      }
    }
    addToast('Bookmark removed', 'info');
  };

  const toggleLike = async (storyId: string): Promise<boolean> => {
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthModalMode('login');
      addToast('Please log in to like stories.', 'warning');
      return false;
    }

    const currentLikes = currentUser.likedStoryIds || [];
    const isAlreadyLiked = currentLikes.includes(storyId);
    const updatedLikes = isAlreadyLiked
      ? currentLikes.filter((id) => id !== storyId)
      : [...currentLikes, storyId];

    setCurrentUser({
      ...currentUser,
      likedStoryIds: updatedLikes,
    });

    const targetStory = stories.find((s) => s.id === storyId);
    const currentCount = targetStory ? (targetStory.likes || 0) : 0;
    const newLikeCount = Math.max(0, currentCount + (isAlreadyLiked ? -1 : 1));

    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, likes: newLikeCount } : s))
    );

    // Sync to Firestore
    try {
      await updateDoc(doc(db, 'stories', storyId), {
        likes: newLikeCount,
      });
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          likedStoryIds: updatedLikes,
        });
      }
    } catch (error) {
      console.warn('Firestore like sync note:', error);
    }

    if (!isAlreadyLiked && targetStory && targetStory.authorId && targetStory.authorId !== currentUser.id) {
      const likeNotif: AppNotification = {
        id: 'notif-' + Date.now(),
        recipientId: targetStory.authorId,
        type: 'story_like',
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatar,
        storyId: targetStory.id,
        storyTitle: targetStory.title,
        read: false,
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'notifications', likeNotif.id), likeNotif);
      } catch {
        // offline
      }
    }

    if (isAlreadyLiked) {
      addToast('Like removed', 'info');
    } else {
      addToast('Liked! Thank you for supporting the author.', 'success');
    }
    return !isAlreadyLiked;
  };

  const isLiked = (storyId: string): boolean => {
    return currentUser ? (currentUser.likedStoryIds || []).includes(storyId) : false;
  };

  // Real view recording: records view when opened, preventing duplicates in session
  const recordView = async (storyId: string) => {
    const sessionKey = `storynest_viewed_${storyId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    const target = stories.find((s) => s.id === storyId);
    const newViews = ((target?.views) || 0) + 1;

    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, views: newViews } : s))
    );

    try {
      await updateDoc(doc(db, 'stories', storyId), {
        views: newViews,
      });
    } catch (e) {
      console.warn('Firestore view counter update note:', e);
    }
  };

  // Reader Reflections / Comments Methods
  const addReflection = async (
    storyId: string,
    content: string,
    guestName?: string
  ): Promise<StoryReflection | null> => {
    const trimmed = content.trim();
    if (!trimmed) return null;

    const reflectionId = 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const timestamp = new Date().toISOString();

    const authorName = currentUser?.displayName || currentUser?.name || guestName?.trim() || 'Anonymous Reader';
    const authorUsername = currentUser?.username || undefined;
    const authorAvatar = currentUser?.avatar || currentUser?.photoURL || undefined;
    const authorRole = currentUser?.role || 'reader';
    const authorUserId = currentUser?.id || ('guest_' + Math.random().toString(36).substring(2, 9));

    const newReflection: StoryReflection = {
      id: reflectionId,
      storyId,
      userId: authorUserId,
      userName: authorName,
      userUsername: authorUsername,
      userAvatar: authorAvatar,
      userRole: authorRole,
      content: trimmed,
      createdAt: timestamp,
      likes: 0,
      likedBy: [],
    };

    // Optimistic UI update
    setReflections((prev) => [newReflection, ...prev]);

    try {
      await setDoc(doc(db, 'reflections', reflectionId), newReflection);
    } catch (error) {
      console.error('Failed to persist reflection to Firestore:', error);
      handleFirestoreError(error, OperationType.CREATE, `reflections/${reflectionId}`);
      return null;
    }

    // Instagram-style comment notification for the story author / post creator
    try {
      let targetStory = stories.find((s) => s.id === storyId);
      if (!targetStory) {
        try {
          const sSnap = await getDoc(doc(db, 'stories', storyId));
          if (sSnap.exists()) {
            targetStory = sSnap.data() as Story;
          }
        } catch {
          // ignore
        }
      }

      if (targetStory) {
        let recipientAuthorId: string | null = null;
        if (targetStory.authorId && targetStory.authorId !== 'guest') {
          recipientAuthorId = targetStory.authorId;
        } else if (targetStory.author) {
          const authorUser = await getUserByIdOrPenName(targetStory.author);
          if (authorUser) {
            recipientAuthorId = authorUser.id;
          }
        }

        // Send notification to author if author is someone else
        if (
          recipientAuthorId &&
          recipientAuthorId !== authorUserId &&
          (!currentUser || (currentUser.id !== recipientAuthorId && currentUser.uid !== recipientAuthorId))
        ) {
          const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
          const commentSnippet = trimmed.length > 80 ? trimmed.slice(0, 80) + '...' : trimmed;
          const reflectionNotif: AppNotification = {
            id: notifId,
            recipientId: recipientAuthorId,
            type: 'story_reflection',
            actorId: authorUserId,
            actorName: authorName,
            actorUsername: authorUsername,
            actorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            storyId: targetStory.id,
            storyTitle: targetStory.title,
            message: commentSnippet,
            read: false,
            createdAt: timestamp,
          };
          await setDoc(doc(db, 'notifications', notifId), reflectionNotif);
        }
      }
    } catch (notifErr) {
      console.warn('Comment notification note:', notifErr);
    }

    addToast('Reflection posted successfully!', 'success');
    return newReflection;
  };

  const deleteReflection = async (reflectionId: string): Promise<boolean> => {
    const target = reflections.find((r) => r.id === reflectionId);
    if (!target) return false;

    const isAuthor = currentUser && target.userId === currentUser.id;
    const isAdminUser = currentUser?.role === 'admin';

    if (!isAuthor && !isAdminUser && !target.userId.startsWith('guest_')) {
      addToast('You can only delete your own reflections.', 'error');
      return false;
    }

    setReflections((prev) => prev.filter((r) => r.id !== reflectionId));

    try {
      await deleteDoc(doc(db, 'reflections', reflectionId));
      addToast('Reflection deleted.', 'info');
      return true;
    } catch (error) {
      console.error('Failed to delete reflection:', error);
      handleFirestoreError(error, OperationType.DELETE, `reflections/${reflectionId}`);
      return false;
    }
  };

  const toggleLikeReflection = async (reflectionId: string): Promise<boolean> => {
    const userId = currentUser?.id || 'guest_' + (sessionStorage.getItem('storynest_guest_id') || (() => {
      const g = Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('storynest_guest_id', g);
      return g;
    })());
    
    const target = reflections.find((r) => r.id === reflectionId);
    if (!target) return false;

    const likedBy = Array.isArray(target.likedBy) ? target.likedBy : [];
    const isAlreadyLiked = likedBy.includes(userId);
    const updatedLikedBy = isAlreadyLiked
      ? likedBy.filter((id) => id !== userId)
      : [...likedBy, userId];
    const newLikesCount = Math.max(0, (target.likes || 0) + (isAlreadyLiked ? -1 : 1));

    setReflections((prev) =>
      prev.map((r) =>
        r.id === reflectionId
          ? { ...r, likes: newLikesCount, likedBy: updatedLikedBy }
          : r
      )
    );

    try {
      await updateDoc(doc(db, 'reflections', reflectionId), {
        likes: newLikesCount,
        likedBy: updatedLikedBy,
      });
      return !isAlreadyLiked;
    } catch (error) {
      console.warn('Like reflection sync notice:', error);
      return !isAlreadyLiked;
    }
  };

  const getStoryReflections = (storyId: string): StoryReflection[] => {
    return reflections.filter((r) => r.storyId === storyId);
  };

  // Reading Progress Dict
  const readingProgress: Record<string, ReadingProgressItem> = {};
  if (currentUser && currentUser.readingHistory) {
    currentUser.readingHistory.forEach((item) => {
      readingProgress[item.storyId] = item;
    });
  }

  const updateReadingProgress = async (
    storyId: string,
    currentChapterOrId: number | string,
    progressPercentage: number = 0
  ) => {
    if (!currentUser) return;

    const chapterNum = typeof currentChapterOrId === 'number' ? currentChapterOrId : 1;
    const progress = Math.min(100, Math.max(0, Math.round(progressPercentage)));

    const existingIndex = (currentUser.readingHistory || []).findIndex((h) => h.storyId === storyId);
    const updatedHistory = [...(currentUser.readingHistory || [])];

    const newItem: ReadingProgressItem = {
      storyId,
      currentChapter: chapterNum,
      chapterNumber: chapterNum,
      progressPercentage: progress,
      progressPercent: progress,
      lastReadAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = newItem;
    } else {
      updatedHistory.unshift(newItem);
    }

    setCurrentUser({
      ...currentUser,
      readingHistory: updatedHistory,
    });

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          readingHistory: updatedHistory,
        });
      } catch (err) {
        console.warn('Firestore reading progress note:', err);
      }
    }
  };

  const getStoryProgress = (storyId: string): number => {
    if (!currentUser || !currentUser.readingHistory) return 0;
    const record = currentUser.readingHistory.find((h) => h.storyId === storyId);
    return record ? record.progressPercentage || record.progressPercent || 0 : 0;
  };

  // Story Creation and Management
  const addStory = async (storyData: Story | Partial<Story>): Promise<Story> => {
    const storyId = storyData.id || 'story-' + Date.now();
    const newStory: Story = {
      id: storyId,
      title: storyData.title || 'Untitled Story',
      author: storyData.author || currentUser?.displayName || currentUser?.name || currentUser?.penName || 'Author',
      authorId: storyData.authorId || currentUser?.id || auth.currentUser?.uid || 'guest',
      description: storyData.description || '',
      genre: (storyData.genre as StoryGenre) || 'Romance',
      secondaryGenre: storyData.secondaryGenre,
      tags: storyData.tags || [],
      coverImage:
        storyData.coverImage ||
        'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop',
      pdfUrl: storyData.pdfUrl || '',
      pdfStoragePath: storyData.pdfStoragePath || '',
      pdfFileName: storyData.pdfFileName || `${storyData.title || 'Story'}.pdf`,
      pdfFileSize: storyData.pdfFileSize || '1.0 MB',
      hasSelectableText: storyData.hasSelectableText !== undefined ? storyData.hasSelectableText : true,
      pageCount: storyData.pageCount || (storyData.chapters?.length || 1),
      extractedText: storyData.extractedText,
      language: storyData.language || 'English',
      createdAt: storyData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      status: storyData.status || 'published',
      visibility: storyData.visibility || 'public',
      rankingScore: 0,
      chapters:
        storyData.chapters && storyData.chapters.length > 0
          ? storyData.chapters
          : [
              {
                id: 'chap-' + Date.now() + '-1',
                chapterNumber: 1,
                chapterTitle: 'The Beginning',
                content: storyData.description || 'This story begins with heart...',
              },
            ],
    };

    const cleanDocData: Record<string, any> = {};
    Object.entries(newStory).forEach(([key, val]) => {
      if (val !== undefined) {
        cleanDocData[key] = val;
      }
    });

    try {
      await setDoc(doc(db, 'stories', storyId), cleanDocData);
    } catch (error) {
      console.warn('Firestore setDoc during addStory error:', error);
    }

    setStories((prev) => {
      const existing = prev.findIndex((s) => s.id === storyId);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = newStory;
        return copy;
      }
      return [newStory, ...prev];
    });

    if (newStory.status === 'pending') {
      addToast('Your story has been submitted and is awaiting editorial review.', 'info');
    } else {
      addToast('Your story has been published successfully!', 'success');
    }
    return newStory;
  };

  const updateStoryStatus = async (storyId: string, status: StoryStatus, reason?: string) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, status, rejectionReason: reason, updatedAt: new Date().toISOString() }
          : s
      )
    );

    try {
      await updateDoc(doc(db, 'stories', storyId), {
        status,
        rejectionReason: reason || '',
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `stories/${storyId}`);
    }

    addToast(`Story status updated to: ${status.toUpperCase()}`, 'success');
  };

  const deleteStory = async (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    if (currentUser) {
      setCurrentUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          bookmarks: (prev.bookmarks || []).filter((id) => id !== storyId),
          bookmarkedStoryIds: (prev.bookmarkedStoryIds || []).filter((id) => id !== storyId),
          likedStoryIds: (prev.likedStoryIds || []).filter((id) => id !== storyId),
          readingHistory: (prev.readingHistory || []).filter((h) => h.storyId !== storyId),
        };
      });
    }
    try {
      await deleteDoc(doc(db, 'stories', storyId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `stories/${storyId}`);
    }
    addToast('Story deleted successfully.', 'info');
  };

  // Reports
  const submitReport = async (
    storyId: string,
    storyTitle: string,
    reason: StoryReport['reason'],
    details: string
  ) => {
    const reportId = 'report-' + Date.now();
    const newReport: StoryReport = {
      id: reportId,
      storyId,
      storyTitle,
      reporterEmail: currentUser?.email || 'anonymous@storynest.com',
      reason,
      details,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    setReports((prev) => [newReport, ...prev]);

    try {
      await setDoc(doc(db, 'reports', reportId), newReport);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reports/${reportId}`);
    }

    addToast('Report submitted to StoryNest moderation team.', 'success');
  };

  const updateReportStatus = async (reportId: string, status: StoryReport['status']) => {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));

    try {
      await updateDoc(doc(db, 'reports', reportId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
    }

    addToast(`Report marked as ${status}.`, 'info');
  };

  const resolveReport = (reportId: string, status: StoryReport['status']) => {
    updateReportStatus(reportId, status);
  };

  // Contacts
  const submitContact = async (name: string, email: string, subject: string, message: string) => {
    const contactId = 'contact-' + Date.now();
    const newSubmission: ContactSubmission = {
      id: contactId,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      status: 'unread',
    };

    setContactMessages((prev) => [newSubmission, ...prev]);

    try {
      await setDoc(doc(db, 'contacts', contactId), newSubmission);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `contacts/${contactId}`);
    }

    addToast('Thank you! Your message has been sent to the StoryNest team.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseUser,
        authReady,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        authErrorCode,
        setAuthErrorCode,
        login,
        signInWithGoogle,
        signup,
        resetPassword,
        logout,
        updateUserProfile,
        deleteAccount,
        follows,
        toggleFollowUser,
        getFollowStatus,
        isFollowingUser,
        hasPendingFollowRequest,
        getFollowers,
        getFollowerUserIds,
        getFollowing,
        getFollowingUserIds,
        getFollowRequests,
        getFollowRequestUserIds,
        acceptFollowRequest,
        rejectFollowRequest,
        canViewUserStories,
        getUserByIdOrPenName,
        getUserByUsername,
        isUsernameAvailable,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        shareModalData,
        openShareModal,
        closeShareModal,
        searchQuery,
        setSearchQuery,
        stories,
        storiesLoading,
        addStory,
        updateStoryStatus,
        deleteStory,
        toggleBookmark,
        isBookmarked,
        removeBookmark,
        toggleLike,
        isLiked,
        recordView,
        reflections,
        reflectionsLoading,
        addReflection,
        deleteReflection,
        toggleLikeReflection,
        getStoryReflections,
        readingProgress,
        updateReadingProgress,
        getStoryProgress,
        reports,
        submitReport,
        updateReportStatus,
        resolveReport,
        contacts: contactMessages,
        contactMessages,
        submitContact,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
