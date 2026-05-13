import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceRecorder({ onTranscript, placeholder = "Speak your thoughts..." }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        onTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech Recognition Error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [onTranscript]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    return <p className="label" style={{ color: 'var(--red)' }}>Voice tracking not supported in this browser.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleRecording}
          type="button"
          className="btn"
          style={{
            background: isRecording ? 'var(--red)' : 'rgba(255,255,255,0.05)',
            color: isRecording ? '#fff' : 'var(--text)',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--glass-stroke)'
          }}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          {isRecording ? 'Stop Recording' : 'Start Voice Note'}
        </motion.button>
        
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-center"
            style={{ gap: '0.5rem', color: 'var(--lime)' }}
          >
            <div className="status-dot" style={{ color: 'var(--lime)' }} />
            <span className="hud-label" style={{ color: 'var(--lime)' }}>Listening...</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass"
            style={{ padding: '1rem', borderStyle: 'dashed', background: 'transparent' }}
          >
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontStyle: 'italic' }}>
              "{transcript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
