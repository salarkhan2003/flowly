import { useCallback, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { showError } from '../lib/alert';

export type VoicePhase = 'idle' | 'listening' | 'review';

export function useVoiceCapture() {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const phaseRef = useRef<VoicePhase>('idle');

  const setPhaseSafe = useCallback((p: VoicePhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript?.trim() ?? '';
    if (!text) return;
    if (event.isFinal) {
      setTranscript((prev) => (prev ? `${prev} ${text}` : text));
      setInterim('');
    } else {
      setInterim(text);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    if (phaseRef.current === 'listening') {
      setPhaseSafe('review');
      setInterim('');
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'aborted' || event.error === 'no-speech') return;
    showError('Voice input', event.message || 'Could not capture speech. Try again.');
    setPhaseSafe('idle');
  });

  const startListening = useCallback(async () => {
    try {
      const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
      if (!available) {
        showError(
          'Voice unavailable',
          'Speech recognition needs a development or production build (not Expo Go).'
        );
        return;
      }

      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        showError('Microphone', 'Allow microphone and speech recognition to use voice.');
        return;
      }

      setTranscript('');
      setInterim('');
      setPhaseSafe('listening');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not start voice capture.';
      showError('Voice input', msg);
      setPhaseSafe('idle');
    }
  }, [setPhaseSafe]);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      /* already stopped */
    }
    setPhaseSafe('review');
    setInterim('');
  }, [setPhaseSafe]);

  const cancel = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      /* ignore */
    }
    setTranscript('');
    setInterim('');
    setPhaseSafe('idle');
  }, [setPhaseSafe]);

  const displayText = [transcript, interim].filter(Boolean).join(transcript && interim ? ' ' : '');

  return {
    phase,
    transcript,
    interim,
    displayText,
    startListening,
    stopListening,
    cancel,
    setTranscript,
    setPhase: setPhaseSafe,
  };
}
