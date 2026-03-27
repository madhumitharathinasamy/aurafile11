import { useState, useCallback, useRef, useEffect } from 'react';

export type ProcessStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface UseFileProcessorOptions<TResult> {
  /**
   * The client-side function responsible for processing the files.
   * It must execute locally in the browser to guarantee privacy.
   */
  processFn: (
    files: File[],
    onProgress: (progress: number) => void
  ) => Promise<TResult>;
}

/**
 * A reusable React hook for managing client-side file processing logic securely without server uploads.
 */
export function useFileProcessor<TResult = Blob | File>({ processFn }: UseFileProcessorOptions<TResult>) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track created Object URLs to strictly garbage collect them and prevent memory leaks
  const objectUrls = useRef<Set<string>>(new Set());

  /**
   * Generates an Object URL that is automatically tracked for garbage collection.
   */
  const createSafeObjectURL = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    objectUrls.current.add(url);
    return url;
  }, []);

  /**
   * Clears the active result, revokes all strictly tracked memory blobs to protect privacy, and resets the state.
   */
  const clearMemory = useCallback(() => {
    objectUrls.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    objectUrls.current.clear();
    setResult(null);
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  // Cleanup on unmount to ensure 100% privacy
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
    };
  }, []);

  /**
   * Triggers the provided `processFn` locally in the browser utilizing the stored file state.
   */
  const processFiles = useCallback(async (inputFiles?: File[]) => {
    const targetFiles = inputFiles || files;
    
    if (!targetFiles || targetFiles.length === 0) {
      setError("No files provided for processing.");
      setStatus("error");
      return;
    }

    try {
      setStatus('processing');
      setProgress(0);
      setError(null);

      // Execute the purely browser-based processing function 
      const processedResult = await processFn(targetFiles, (p: number) => {
        // Enforce progression limits 0-100%
        setProgress(Math.min(Math.max(p, 0), 100));
      });

      setResult(processedResult);
      setProgress(100);
      setStatus('completed');
    } catch (err: any) {
      console.error("Local file processing error:", err);
      const errorMessage = (err && typeof err === 'object' && err.message) 
        ? err.message 
        : (typeof err === 'string' ? err : "An error occurred during local file processing.");
      
      setError(errorMessage);
      setStatus('error');
      setProgress(0);
    }
  }, [files, processFn]);

  return {
    files,
    setFiles,
    status,
    progress,
    result,
    error,
    processFiles,
    clearMemory,
    createSafeObjectURL,
  };
}
