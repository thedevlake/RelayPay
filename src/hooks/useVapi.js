import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VapiImport from '@vapi-ai/web';

const ASSISTANT_ID = '2367cacf-762d-4d5c-967d-da235912160d';

/**
 * Pull a single line of text from VAPI / Daily error shapes (message may be a string or { msg }).
 */
function humanizeErrorPart(value) {
  if (value == null) return null;
  if (typeof value === 'string') {
    const t = value.trim();
    return t || null;
  }
  if (typeof value !== 'object') return null;

  if (typeof value.errorMsg === 'string' && value.errorMsg.trim()) return value.errorMsg.trim();
  if (typeof value.msg === 'string' && value.msg.trim()) return value.msg.trim();
  if (typeof value.message === 'string' && value.message.trim()) return value.message.trim();
  if (value.message && typeof value.message === 'object') {
    const inner = humanizeErrorPart(value.message);
    if (inner) return inner;
  }
  if (value.error && typeof value.error === 'object') {
    const inner = humanizeErrorPart(value.error);
    if (inner) return inner;
  }
  return null;
}

const DAILY_EJECTED_HINT =
  'The call session ended. You can start a new support call when you are ready.';

/**
 * VAPI emits `error` as `{ type, stage?, error: ... }` — Daily often nests `{ message: { msg } }`.
 */
function formatVapiError(eventError) {
  if (eventError == null) return 'Something went wrong. Please try again.';
  if (typeof eventError === 'string') return eventError;

  const topText = humanizeErrorPart(eventError);
  const nestedText = humanizeErrorPart(eventError.error);
  const line = nestedText || topText;

  if (line) {
    const isEjected =
      eventError.type === 'daily-error' &&
      (line.toLowerCase().includes('meeting has ended') ||
        line.toLowerCase().includes('ejected'));
    if (isEjected) return DAILY_EJECTED_HINT;

    if (eventError.type === 'daily-error') return line;

    const stage = [eventError.type, eventError.stage].filter(Boolean).join(' · ');
    return stage ? `${stage}: ${line}` : line;
  }

  return 'Something went wrong. Please try again.';
}

export function useVapi() {
  const VapiClient = VapiImport?.default ?? VapiImport;
  const hasPublicKey =
    Boolean(import.meta.env.VITE_VAPI_PUBLIC_KEY) &&
    import.meta.env.VITE_VAPI_PUBLIC_KEY !== 'your_key_here';
  const vapiRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [error, setError] = useState(
    hasPublicKey ? '' : 'Missing VAPI key. Set VITE_VAPI_PUBLIC_KEY in .env.'
  );

  useEffect(() => {
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

    if (!publicKey || publicKey === 'your_key_here') return undefined;

    const vapi = new VapiClient(publicKey);
    vapiRef.current = vapi;

    const onCallStart = () => {
      setError('');
      setIsCallActive(true);
      setStatus('Connected');
    };

    const onCallEnd = () => {
      setIsCallActive(false);
      setIsSpeaking(false);
      setIsMuted(false);
      setStatus('Call ended');
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
      setStatus('Agent speaking');
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
      setStatus('Listening');
    };

    const onError = (eventError) => {
      setError(formatVapiError(eventError));
      setStatus('Error');
    };

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('error', onError);
      vapi.stop();
      vapiRef.current = null;
    };
  }, [VapiClient]);

  const startCall = useCallback(async ({ customer_name, customer_email, issue_type }) => {
    if (!vapiRef.current) {
      setError('VAPI is not initialized.');
      return false;
    }

    setError('');
    setStatus('Connecting...');

    try {
      await vapiRef.current.start(ASSISTANT_ID, {
        variableValues: {
          customer_name,
          customer_first_name: customer_name.split(" ")[0],
          customer_email,
          issue_type,
        },
      });
      return true;
    } catch (startError) {
      setStatus('Error');
      setError(startError?.message || 'Unable to start call.');
      return false;
    }
  }, []);

  const endCall = useCallback(() => {
    if (!vapiRef.current) return;
    vapiRef.current.stop();
  }, []);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;

    if (isMuted) {
      vapiRef.current.setMuted(false);
      setIsMuted(false);
      setStatus('Unmuted');
    } else {
      vapiRef.current.setMuted(true);
      setIsMuted(true);
      setStatus('Muted');
    }
  }, [isMuted]);

  return useMemo(
    () => ({
      isCallActive,
      isSpeaking,
      isMuted,
      status,
      error,
      startCall,
      endCall,
      toggleMute
    }),
    [isCallActive, isSpeaking, isMuted, status, error, startCall, endCall, toggleMute]
  );
}
