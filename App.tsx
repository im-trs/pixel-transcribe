import React, { useState, useRef, useCallback } from 'react';
import { RetroCard } from './components/RetroCard';
import { RetroButton } from './components/RetroButton';
import { LoadingIndicator } from './components/LoadingIndicator';
import { processAudioWithGemini, validateFile } from './services/geminiService';
import { AppStatus, FileData, ProcessedResult } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setFileData(null);
      setResult(null);
      return;
    }

    setError(null);
    setStatus(AppStatus.IDLE);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 part (remove "data:audio/mp3;base64,")
      const base64 = result.split(',')[1];
      setFileData({
        file,
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!fileData) return;

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const data = await processAudioWithGemini(fileData.file);
      setResult(data);
      setStatus(AppStatus.COMPLETED);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
      setStatus(AppStatus.ERROR);
    }
  }, [fileData]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetApp = () => {
    setFileData(null);
    setResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center font-pixel">
      <div className="w-full max-w-4xl space-y-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl mb-2 text-black uppercase tracking-widest drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">
            Pixel<span className="text-retro-blue">Transcribe</span>
          </h1>
          <p className="text-xl text-gray-700 bg-white inline-block px-4 py-1 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            AI-Powered Audio Analysis
          </p>
        </div>

        {/* Upload Section */}
        <RetroCard title="Input Source" color="yellow" className="mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex-1 text-center md:text-left">
              <p className="mb-2 text-xl">Supported: MP3, MP4</p>
              <p className="text-sm opacity-70">Max size: ~19MB (Demo Limit)</p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/mp3,audio/mpeg,video/mp4,audio/mp4,audio/wav"
              className="hidden"
            />

            <div className="flex gap-4">
              {!fileData ? (
                <RetroButton onClick={triggerFileInput} variant="primary">
                  Select File
                </RetroButton>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2">
                    <span className="w-3 h-3 bg-green-500 rounded-none animate-pulse" />
                    <span className="truncate max-w-[200px]">{fileData.file.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <RetroButton onClick={resetApp} variant="danger" className="text-sm py-1 px-3">
                      Clear
                    </RetroButton>
                    <RetroButton
                      onClick={handleProcess}
                      disabled={status === AppStatus.PROCESSING}
                      variant="primary"
                    >
                      {status === AppStatus.PROCESSING ? 'Running...' : 'Analyze'}
                    </RetroButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </RetroCard>

        {/* Error Display */}
        {error && (
          <RetroCard color="red" className="animate-bounce">
            <div className="text-white text-center font-bold text-xl">
              ERROR: {error}
            </div>
          </RetroCard>
        )}

        {/* Processing State */}
        {status === AppStatus.PROCESSING && (
          <RetroCard>
            <LoadingIndicator />
          </RetroCard>
        )}

        {/* Results Section */}
        {status === AppStatus.COMPLETED && result && (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">

            <RetroCard title="Summary" color="blue">
              <div className="prose font-pixel text-xl leading-relaxed max-w-none">
                {result.summary}
              </div>
            </RetroCard>

            <RetroCard title="Full Transcription" color="white">
              <div className="absolute -top-5 right-4 flex gap-2">
                <RetroButton
                  onClick={() => {
                    navigator.clipboard.writeText(result.transcription);
                  }}
                  variant="secondary"
                  className="!px-3 !py-1 flex items-center gap-2 text-sm"
                  title="Copy to Clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy
                </RetroButton>
                <RetroButton
                  onClick={() => {
                    const blob = new Blob([result.transcription], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'transcription.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  variant="primary"
                  className="!px-3 !py-1 flex items-center gap-2 text-sm"
                  title="Download Text"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </RetroButton>
              </div>
              <div className="max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                <p className="whitespace-pre-wrap font-pixel text-lg leading-relaxed text-gray-800">
                  {result.transcription}
                </p>
              </div>
            </RetroCard>

            <div className="text-center">
              <RetroButton onClick={resetApp} variant="secondary">
                Start Over
              </RetroButton>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
