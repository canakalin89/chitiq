import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StopIcon } from '../icons/StopIcon';
import { MicIcon } from '../icons/MicIcon';

interface RecorderProps {
  onStop: (audioBlob: Blob) => void;
  onCancel: () => void;
  topic: string;
}

const MAX_RECORDING_TIME = 180;

const Recorder: React.FC<RecorderProps> = ({ onStop, onCancel, topic }) => {
  const { t, i18n } = useTranslation();

  const [hasStarted, setHasStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => { return () => cleanup(); }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (error) return;
        if (!hasStarted) startRecording();
        else if (isRecording) stopRecording();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (isReviewing) handleEvaluate();
      } else if (e.code === 'KeyR' || e.code === 'Backspace') {
        if (isReviewing) handleRetry();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isRecording, isReviewing, error, audioBlob, audioUrl, onStop]);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= MAX_RECORDING_TIME) { stopRecording(); return prev; }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const getSupportedMimeType = () => {
    const types = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/wav'];
    for (const type of types) { if (MediaRecorder.isTypeSupported(type)) return type; }
    return '';
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      ctx.fillStyle = 'rgba(251, 113, 133, 0.6)'; // rose-400
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
        const centerY = canvas.height / 2 - barHeight / 2;
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 + x, centerY, barWidth, barHeight, barWidth / 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - x - barWidth, centerY, barWidth, barHeight, barWidth / 2);
        ctx.fill();
        x += barWidth + 3;
      }
    };
    draw();
  };

  const fetchTranscription = async (blob: Blob, mimeType: string): Promise<string> => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) binary += String.fromCharCode(uint8Array[i]);
      const audioBase64 = btoa(binary);
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType: mimeType || 'audio/webm' }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.transcript ?? '';
      }
    } catch {}
    return '';
  };

  const startRecording = async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      setError(t('errors.micPermission'));
      return;
    }
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const audioContext = new AudioContextClass();
    audioContextRef.current = audioContext;
    if (audioContext.state === 'suspended') await audioContext.resume();
    setError(null); setHasStarted(true); setIsRecording(true);
    isRecordingRef.current = true;
    try {
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.start(1000);
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const silentDest = audioContext.createMediaStreamDestination();
      source.connect(analyser);
      analyser.connect(silentDest);
      drawVisualizer();
    } catch { setError(t('errors.generic')); cleanup(); }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false); isRecordingRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const mimeType = mediaRecorderRef.current.mimeType;
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioBlob(blob); setAudioUrl(URL.createObjectURL(blob)); cleanup();
        setIsTranscribing(true);
        const text = await fetchTranscription(blob, mimeType || 'audio/webm');
        setTranscription(text); setIsTranscribing(false); setIsReviewing(true);
      };
      mediaRecorderRef.current.stop();
    } else { cleanup(); }
  };

  const handleEvaluate = () => { if (audioBlob) onStop(audioBlob); };

  const handleRetry = () => {
    setAudioBlob(null);
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    setIsReviewing(false); setHasStarted(false); setTimer(0); setTranscription('');
  };

  const cleanup = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch {}
    }
    if (analyserRef.current) analyserRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isTr = i18n.language.startsWith('tr');

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="card overflow-hidden animate-fade-in">
        <div className="bg-rose-500 px-6 py-4">
          <p className="font-black text-white text-base">{t('errors.micTitle')}</p>
        </div>
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 font-medium">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onCancel} className="px-5 py-2.5 text-sm font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:scale-105 transition-all">{t('common.goBack')}</button>
            <button onClick={() => window.location.reload()} className="px-5 py-2.5 text-sm font-black text-white bg-violet-600 hover:bg-violet-700 rounded-2xl hover:scale-105 transition-all">{t('common.retry')}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Transcribing ───────────────────────────────────────────────────────────
  if (isTranscribing) {
    return (
      <div className="card min-h-[400px] flex flex-col items-center justify-center gap-5 animate-fade-in">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-base font-black text-slate-900 dark:text-white">{t('recorder.transcribing') || (isTr ? 'Konuşma analiz ediliyor...' : 'Transcribing your speech...')}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('recorder.transcribingHint') || (isTr ? 'Bir saniye...' : 'Just a moment.')}</p>
        </div>
      </div>
    );
  }

  // ── Review ─────────────────────────────────────────────────────────────────
  if (isReviewing) {
    return (
      <div className="card min-h-[480px] flex flex-col animate-fade-in overflow-hidden">
        {/* Emerald header band */}
        <div className="bg-emerald-500 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-base font-black text-white">{t('common.reviewRecording')}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 text-center italic">"{topic}"</p>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 min-h-[120px] border-2 border-slate-100 dark:border-slate-700">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">{t('evaluation.transcription')}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {transcription || <span className="text-slate-400 italic">{t('errors.noSpeechDetected')}</span>}
            </p>
          </div>

          {audioUrl && (
            <audio src={audioUrl} controls className="w-full h-10 rounded-xl" />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex gap-3 border-t-2 border-slate-100 dark:border-slate-800">
          <button onClick={handleRetry} className="flex-1 py-3 text-sm font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-slate-200 dark:border-slate-700">
            {t('common.retry')} <span className="text-[10px] opacity-60 ml-1">R</span>
          </button>
          <button onClick={handleEvaluate} className="flex-[2] py-3 text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex items-center justify-center gap-2">
            {t('common.evaluate')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-[10px] opacity-70 ml-1">ENTER</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Pre-record ─────────────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className="card overflow-hidden animate-fade-in">
        {/* Violet header band */}
        <div className="bg-violet-600 px-6 py-5 text-center">
          <p className="text-sm font-black text-white/80 mb-1 uppercase tracking-wide">{isTr ? 'Konu' : 'Topic'}</p>
          <p className="text-lg font-black text-white italic">"{topic}"</p>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center justify-center gap-6 p-10 text-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-violet-100 dark:bg-violet-900/20 rounded-full blur-2xl opacity-60"></div>
            <button
              onClick={startRecording}
              className="relative w-28 h-28 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex flex-col items-center justify-center gap-1.5 shadow-xl shadow-violet-200 dark:shadow-violet-900/30 hover:scale-110 active:scale-95 transition-all"
            >
              <MicIcon className="w-10 h-10" />
              <span className="text-[9px] font-black uppercase tracking-wide opacity-90">SPACE</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-base font-black text-slate-900 dark:text-white">
              💪 {isTr ? 'Hazır mısın? Al nefesini ve başla!' : 'Ready? Take a breath and go!'}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{isTr ? 'Maks 3 dakika' : 'Up to 3 minutes'}</p>
          </div>

          <button onClick={onCancel} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition-colors">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    );
  }

  // ── Recording ──────────────────────────────────────────────────────────────
  return (
    <div className="card min-h-[400px] flex flex-col animate-fade-in overflow-hidden">
      {/* Rose header band */}
      <div className="bg-rose-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </div>
            <span className="text-base font-black text-white">{t('dashboard.recording')}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-lg font-black text-white tabular-nums">
            {formatTime(timer)} <span className="text-white/70 text-sm font-bold">/ 03:00</span>
          </span>
          <div className="w-28 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${(timer / MAX_RECORDING_TIME) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 italic text-center">"{topic}"</p>
        <div className="relative w-full h-16">
          <canvas ref={canvasRef} width={800} height={64} className="w-full h-full opacity-90 pointer-events-none" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button onClick={onCancel} className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          {t('common.cancel')}
        </button>
        <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-rose-200 dark:shadow-rose-900/30 hover:scale-105 active:scale-95">
          <StopIcon className="w-4 h-4 fill-current" />
          {t('dashboard.stopRecording')}
          <span className="text-[10px] opacity-75 ml-1">SPACE</span>
        </button>
      </div>
    </div>
  );
};

export default Recorder;
