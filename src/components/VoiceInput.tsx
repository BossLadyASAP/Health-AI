
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscription: (text: string, detectedLanguage?: string) => void;
  onLanguageDetected?: (language: string) => void;
  isListening?: boolean;
  className?: string;
}

export function VoiceInput({ 
  onTranscription, 
  onLanguageDetected, 
  isListening: externalListening,
  className = ""
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const effectiveListening = externalListening !== undefined ? externalListening : isListening;

  useEffect(() => {
    // Initialize Web Speech API if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'auto'; // Auto-detect language
        
        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            // Detect language from the transcript
            const detectedLang = detectLanguage(finalTranscript);
            onTranscription(finalTranscript, detectedLang);
            if (onLanguageDetected && detectedLang) {
              onLanguageDetected(detectedLang);
            }
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast.error('Speech recognition error: ' + event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [onTranscription, onLanguageDetected]);

  const detectLanguage = (text: string): string => {
    // Simple language detection based on character patterns
    const patterns = {
      'Spanish': /[ñáéíóúü]/i,
      'French': /[àâäéèêëïîôöùûüÿç]/i,
      'German': /[äöüß]/i,
      'Italian': /[àèéìíîòóù]/i,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'English'; // Default to English
  };

  const startListening = async () => {
    try {
      if (recognitionRef.current) {
        setIsListening(true);
        recognitionRef.current.start();
        toast.success('Listening... Speak now');
      } else {
        // Fallback to MediaRecorder API
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          
          // Convert blob to base64 and send to speech-to-text service
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            if (base64Audio) {
              // Here you would typically send to a speech-to-text API
              // For now, we'll simulate the response
              setTimeout(() => {
                onTranscription("Simulated transcription from audio");
                setIsProcessing(false);
              }, 1000);
            }
          };
          reader.readAsDataURL(audioBlob);

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsListening(true);
        toast.success('Recording... Speak now');
      }
    } catch (error) {
      console.error('Error starting voice input:', error);
      toast.error('Error accessing microphone');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (effectiveListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      onClick={toggleListening}
      disabled={isProcessing}
      variant={effectiveListening ? "default" : "outline"}
      size="sm"
      className={`${className} ${effectiveListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
    >
      {isProcessing ? (
        <Volume2 className="h-4 w-4 animate-pulse" />
      ) : effectiveListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="ml-2">
        {isProcessing ? 'Processing...' : effectiveListening ? 'Stop' : 'Voice'}
      </span>
    </Button>
  );
}
