import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Story } from '../types';

// IndexedDB configuration for client-side persistence of uploaded PDF binaries
const DB_NAME = 'StoryNest_PDF_Storage';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_documents';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'storyId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Memory cache as fallback for IndexedDB in sandboxed environments
const memoryCache = new Map<string, { data: ArrayBuffer; fileName: string; type: string }>();

export async function storePdfLocally(storyId: string, file: File | Blob, fileName: string): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Cache a clean copy in memory
    memoryCache.set(storyId, {
      data: arrayBuffer.slice(0),
      fileName,
      type: file.type || 'application/pdf',
    });

    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        storyId,
        fileName,
        type: file.type || 'application/pdf',
        size: file.size,
        data: arrayBuffer.slice(0),
        updatedAt: new Date().toISOString(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return URL.createObjectURL(new Blob([arrayBuffer.slice(0)], { type: 'application/pdf' }));
  } catch (err) {
    console.warn('Could not store PDF in IndexedDB (using memory cache & blob url):', err);
    try {
      const arrayBuffer = await file.arrayBuffer();
      memoryCache.set(storyId, {
        data: arrayBuffer.slice(0),
        fileName,
        type: file.type || 'application/pdf',
      });
    } catch (e) {}
    return URL.createObjectURL(file);
  }
}

export async function getLocalPdfData(storyId: string): Promise<{ data: ArrayBuffer; fileName: string; type: string } | null> {
  // Check memory cache first
  if (memoryCache.has(storyId)) {
    const cached = memoryCache.get(storyId)!;
    if (cached && cached.data && cached.data.byteLength > 0 && !(cached.data as any).detached) {
      return {
        data: cached.data.slice(0),
        fileName: cached.fileName,
        type: cached.type,
      };
    } else {
      memoryCache.delete(storyId);
    }
  }

  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(storyId);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          const rawData: ArrayBuffer = req.result.data;
          if (rawData && rawData.byteLength > 0 && !(rawData as any).detached) {
            // Keep a fresh cloned copy in memoryCache
            memoryCache.set(storyId, {
              data: rawData.slice(0),
              fileName: req.result.fileName || 'story.pdf',
              type: req.result.type || 'application/pdf',
            });
            resolve({
              data: rawData.slice(0),
              fileName: req.result.fileName || 'story.pdf',
              type: req.result.type || 'application/pdf',
            });
            return;
          }
        }
        resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Error reading from IndexedDB:', err);
    return null;
  }
}

export interface UploadPdfResult {
  pdfUrl: string;
  pdfStoragePath: string;
  blobUrl?: string;
  isCloudStored: boolean;
}

export async function uploadStoryPdfToStorage(
  storyId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadPdfResult> {
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `stories/${storyId}/${cleanFileName}`;

  // 1. Always store locally in IndexedDB & memory first so reader works instantly & offline
  let blobUrl = '';
  try {
    blobUrl = await storePdfLocally(storyId, file, file.name);
  } catch (e) {
    console.warn('Local caching note:', e);
  }

  // 2. Upload to Firebase Storage with timeout protection
  let finalDownloadUrl = blobUrl;
  let isCloudStored = false;

  try {
    const storageRef = ref(storage, storagePath);
    if (onProgress) onProgress(30);

    // Timeout promise for cloud storage upload (15 seconds)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timeout')), 15000)
    );

    const uploadTaskPromise = (async () => {
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: 'application/pdf',
        customMetadata: {
          storyId,
          originalName: file.name,
        },
      });
      if (onProgress) onProgress(75);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    })();

    const downloadUrl = await Promise.race([uploadTaskPromise, timeoutPromise]);
    finalDownloadUrl = downloadUrl;
    isCloudStored = true;
    if (onProgress) onProgress(100);
  } catch (storageErr) {
    console.warn('Firebase Storage upload warning (falling back to secure local storage):', storageErr);
    // In case Firebase Storage bucket is restricted or offline, blobUrl keeps it 100% working
    if (!finalDownloadUrl) {
      finalDownloadUrl = URL.createObjectURL(file);
    }
    if (onProgress) onProgress(100);
  }

  return {
    pdfUrl: finalDownloadUrl,
    pdfStoragePath: storagePath,
    blobUrl,
    isCloudStored,
  };
}

export async function downloadStoryPdfFile(story: Story): Promise<void> {
  const fileName = story.pdfFileName || `${story.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  // 1. Try to load from IndexedDB
  const localData = await getLocalPdfData(story.id);
  if (localData) {
    const blob = new Blob([localData.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    triggerBrowserDownload(url, fileName);
    return;
  }

  // 2. If story.pdfUrl exists, trigger download
  if (story.pdfUrl) {
    try {
      const response = await fetch(story.pdfUrl);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      triggerBrowserDownload(url, fileName);
      return;
    } catch (e) {
      // Fallback: open link directly
      window.open(story.pdfUrl, '_blank');
      return;
    }
  }

  throw new Error('No PDF found for this story');
}

function triggerBrowserDownload(url: string, fileName: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
