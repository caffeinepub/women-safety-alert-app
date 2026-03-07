import { useEffect, useRef, useState } from "react";

const TRIGGER_KEYWORDS = ["help me", "emergency", "help", "sos"];

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
};

type SpeechRecognitionAlternative = {
  transcript: string;
};

export function useVoiceActivation(
  onTrigger: () => void,
  enabled: boolean,
): { isListening: boolean } {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const onTriggerRef = useRef(onTrigger);
  const isRestarting = useRef(false);
  onTriggerRef.current = onTrigger;

  useEffect(() => {
    if (!enabled) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition: SpeechRecognitionType = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.toLowerCase().trim();
        const matched = TRIGGER_KEYWORDS.some((kw) => transcript.includes(kw));
        if (matched) {
          onTriggerRef.current();
          break;
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still enabled
      if (enabled && !isRestarting.current) {
        isRestarting.current = true;
        setTimeout(() => {
          isRestarting.current = false;
          try {
            recognition.start();
            setIsListening(true);
          } catch {}
        }, 1000);
      }
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }

    return () => {
      isRestarting.current = false;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {}
      setIsListening(false);
    };
  }, [enabled]);

  return { isListening };
}
