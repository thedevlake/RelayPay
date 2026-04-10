import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VapiImport from '@vapi-ai/web';

const ASSISTANT_ID = '2367cacf-762d-4d5c-967d-da235912160d';

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
      const message = eventError?.message || 'A VAPI error occurred.';
      setError(message);
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
