import { useCallback, useEffect, useRef, useState } from 'react';

type DownloadStatus = 'idle' | 'downloading' | 'complete' | 'error';

interface DownloadState {
  progress: number;
  status: DownloadStatus;
  error: string | null;
  downloadedBytes: number;
  totalBytes: number;
  timeLeft: number;
}

interface UseDownloadReturn {
  progress: number;
  status: DownloadStatus;
  error: string | null;
  downloadedBytes: number;
  totalBytes: number;
  timeLeft: number;
  startDownload: (url: string, filename?: string) => Promise<void>;
}

export function useDownload(): UseDownloadReturn {
  const [state, setState] = useState<DownloadState>({
    progress: 0,
    status: 'idle',
    error: null,
    downloadedBytes: 0,
    totalBytes: 0,
    timeLeft: 0,
  });

  const startTimeRef = useRef<number>(0);
  const objectUrlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const extractFilename = useCallback((url: string, contentDisposition?: string | null): string => {
    // Try to get filename from Content-Disposition header
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        let filename = filenameMatch[1].replace(/['"]/g, '');
        // Handle UTF-8 encoded filenames
        if (filename.startsWith('UTF-8')) {
          filename = filename.replace(/^UTF-8''/, '');
          try {
            filename = decodeURIComponent(filename);
          } catch {
            // Keep as-is if decoding fails
          }
        }
        return filename;
      }
    }

    // Fallback: derive from URL
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      return filename || 'download';
    } catch {
      return 'download';
    }
  }, []);

  const startDownload = useCallback(async (url: string, filename?: string) => {
    // Reset state
    setState({
      progress: 0,
      status: 'downloading',
      error: null,
      downloadedBytes: 0,
      totalBytes: 0,
      timeLeft: 0,
    });

    startTimeRef.current = Date.now();
    let downloadId: string | null = null;
    const sid = localStorage.getItem('visitorSession') || `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    console.log('[DOWNLOAD] Button clicked. Attempting to create admin log...');
    console.log('[DOWNLOAD] Using session ID:', sid);

    try {
      // 1. CREATE the admin log entry immediately with status: pending
      try {
        const logResponse = await fetch(`/api/public/download?sid=${encodeURIComponent(sid)}&file=${encodeURIComponent(filename || 'update.exe')}`);
        console.log('[DOWNLOAD] Admin API response status:', logResponse.status);
        
        if (logResponse.ok) {
          const logData = await logResponse.json();
          console.log('[DOWNLOAD] Admin log created successfully:', logData);
          downloadId = logData.id || null;
        } else {
          const errorText = await logResponse.text();
          console.error('[DOWNLOAD] Admin API returned error:', logResponse.status, errorText);
        }
      } catch (adminError) {
        console.error('[DOWNLOAD] CRITICAL: Failed to create admin log entry:', adminError);
      }

      // Use proxy endpoint to bypass CORS
      const proxyUrl = `/api/public/download-proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          throw new Error('File unavailable on server');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get total bytes from Content-Length header
      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

      // Extract filename from headers or use provided one
      const contentDisposition = response.headers.get('content-disposition');
      const finalFilename = filename || extractFilename(url, contentDisposition);

      // Get reader for streaming
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available for response body');
      }

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      // Read stream in chunks
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // ✅ ONLY HERE: Verify download completed successfully
          // Check if we received the expected amount of data (if Content-Length was provided)
          if (totalBytes > 0 && receivedLength !== totalBytes) {
            throw new Error(`Download incomplete: received ${receivedLength} bytes, expected ${totalBytes} bytes`);
          }

          // ✅ ONLY HERE: Create blob from chunks
          const blob = new Blob(chunks as BlobPart[]);
          
          // ✅ ONLY HERE: Create object URL
          objectUrlRef.current = URL.createObjectURL(blob);
          
          // ✅ ONLY HERE: Trigger download
          const link = document.createElement('a');
          link.href = objectUrlRef.current;
          link.download = finalFilename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // ✅ ONLY HERE: UPDATE the admin log entry to 'complete'
          if (downloadId && sid) {
            try {
              await fetch(`/api/public/download-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  downloadId,
                  downloadedBytes: receivedLength,
                  totalBytes: totalBytes,
                  progressPercent: 100,
                  elapsedSeconds: (Date.now() - startTimeRef.current) / 1000,
                  completed: true,
                }),
              });
            } catch (error) {
              console.error("Failed to update download log to complete:", error);
            }
          }

          // ✅ ONLY HERE: Update state to complete only after successful download and save dialog trigger
          setState(prev => ({
            ...prev,
            status: 'complete',
            progress: 100,
            timeLeft: 0,
          }));

          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        // Calculate progress
        const progress = totalBytes > 0 ? (receivedLength / totalBytes) * 100 : 0;
        
        // Calculate time remaining
        const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
        const remainingPercent = 100 - progress;
        const timeLeft = progress > 0 && remainingPercent > 0 
          ? (elapsedSeconds / progress) * remainingPercent 
          : 0;

        setState(prev => ({
          ...prev,
          progress,
          downloadedBytes: receivedLength,
          totalBytes: totalBytes || prev.totalBytes,
          timeLeft: Math.round(timeLeft),
        }));
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setState({
          progress: 0,
          status: 'idle',
          error: null,
          downloadedBytes: 0,
          totalBytes: 0,
          timeLeft: 0,
        });
      }, 3000);

    } catch (error) {
      // 3. UPDATE the admin log entry to 'failed' on error
      if (downloadId && sid) {
        try {
          await fetch(`/api/public/download-progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              downloadId,
              completed: false,
            }),
          });
        } catch (logError) {
          console.error("Failed to update download log to failed:", logError);
        }
      }

      // Handle different error types
      let errorMessage = 'Download failed';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error - please check your connection';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Cross-origin download blocked by browser';
        } else if (error.message.includes('File unavailable on server')) {
          errorMessage = 'File unavailable on server';
        } else if (error.message.includes('Download incomplete')) {
          errorMessage = 'Download incomplete - please try again';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
    } finally {
      // Cleanup
      if (objectUrlRef.current) {
        const urlToRevoke = objectUrlRef.current;
        setTimeout(() => {
          URL.revokeObjectURL(urlToRevoke);
          objectUrlRef.current = null;
        }, 1000);
      }
    }
  }, [extractFilename]);

  return {
    progress: state.progress,
    status: state.status,
    error: state.error,
    downloadedBytes: state.downloadedBytes,
    totalBytes: state.totalBytes,
    timeLeft: state.timeLeft,
    startDownload,
  };
}
