import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  api,
  StructuredTutorResponse,
  StructuredImageUnderstanding,
  TutorConversationSummary,
  SmartSuggestion,
} from "@/lib/api";
import { ttsService, TTSState } from "@/services/tts.service";
import { toast } from "sonner";
import {
  Send,
  Bot,
  User,
  Sparkles,
  History,
  PlusCircle,
  BookOpen,
  Loader2,
  ChevronRight,
  MessageSquare,
  Mic,
  Square,
  Volume2,
  VolumeX,
  Radio,
  Pause,
  Play,
  Image as ImageIcon,
  X,
  Camera,
  Compass,
  Edit3,
  Trash2,
  AlertCircle,
  RotateCcw,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  math?: any;
  sourceRefs?: any[];
  retryText?: string;
  image?: {
    previewUrl: string;
    fileName?: string;
  };
  imageUnderstanding?: StructuredImageUnderstanding | null;
}

function getDynamicVedicGreeting(): string {
  const now = new Date();
  const hour = now.getHours();
  let timeGreeting = "Good day";
  let timeEmoji = "✨";

  if (hour >= 5 && hour < 12) {
    timeGreeting = "Good morning";
    timeEmoji = "🌅";
  } else if (hour >= 12 && hour < 17) {
    timeGreeting = "Good afternoon";
    timeEmoji = "☀️";
  } else if (hour >= 17 && hour < 22) {
    timeGreeting = "Good evening";
    timeEmoji = "🌇";
  } else {
    timeGreeting = "Welcome to late-night Vedic exploration";
    timeEmoji = "🌙";
  }

  let learnerName = "Learner";
  try {
    const stored = localStorage.getItem("dwanda_user");
    if (stored) {
      const u = JSON.parse(stored);
      if (u.name && u.name.trim()) learnerName = u.name.trim();
    }
  } catch {}

  return `🙏 **Namaste, ${learnerName}! ${timeGreeting}! ${timeEmoji}**

I am your **Vedic Mathematics AI Guru & Adaptive Tutor**. 

I am here to guide your mental arithmetic journey using ancient Indian speed calculation algorithms:

- 🕉️ **Explore the 16 Sutras & 13 Sub-Sutras** with clear, step-by-step proofs
- ⚡ **Solve high-speed mental calculations** without tedious longhand calculation
- 💡 **Diagnose calculation mistakes** and reveal instant Vedic shortcuts
- 📸 **Upload photos of your handwritten scratchpad** for real-time mathematical step verification
- 🎙️ **Speak your math questions directly** with enhanced speech-to-text
- ✍️ **Receive Socratic hints** to strengthen your intuition without spoiling answers

What mathematical technique or problem would you like to explore together right now?`;
}

function createInitialGreeting(): Message {
  return {
    id: "initial-greeting",
    role: "assistant",
    content: getDynamicVedicGreeting(),
  };
}

export default function TutorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const promptParam = searchParams.get("prompt");
  const topicIdParam = searchParams.get("topicId");
  const lessonIdParam = searchParams.get("lessonId");
  const courseIdParam = searchParams.get("courseId");
  const moduleIdParam = searchParams.get("moduleId");

  const [messages, setMessages] = useState<Message[]>(() => [createInitialGreeting()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);

  // Multimodal Image State
  const [attachedImage, setAttachedImage] = useState<{
    file: File;
    previewUrl: string;
    base64: string;
    mimeType: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice STT State
  type VoiceState =
    | "IDLE"
    | "REQUESTING_PERMISSION"
    | "RECORDING"
    | "PROCESSING"
    | "REVIEWING"
    | "ERROR";

  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [reviewTranscript, setReviewTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [liveVolume, setLiveVolume] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceChatMode, setVoiceChatMode] = useState<boolean>(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveTranscriptRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);
  const autoSpeakNextReplyRef = useRef<boolean>(false);

  // Web Audio API Waveform references
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // TTS State
  const [ttsState, setTtsState] = useState<TTSState>(ttsService.getState());

  // Smart Pedagogical Suggestions
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // History Drawer State
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<TutorConversationSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const initialPromptSent = useRef(false);

  // Auto-scroll chat
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, attachedImage]);

  // Subscribe to TTS changes
  useEffect(() => {
    const unsubscribe = ttsService.subscribe((state) => {
      setTtsState(state);
    });
    return () => {
      unsubscribe();
      ttsService.stop();
    };
  }, []);

  // Load conversation history and smart suggestions on mount
  useEffect(() => {
    loadConversationHistory();
    loadSmartSuggestions();
  }, []);

  // Support clipboard pasting of math images (e.g. screenshots from Win+Shift+S)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Handle inbound prompt from Lesson or Practice
  useEffect(() => {
    if (promptParam && !initialPromptSent.current) {
      initialPromptSent.current = true;
      handleSend(promptParam);
    }
  }, [promptParam]);

  const loadConversationHistory = async () => {
    try {
      setLoadingHistory(true);
      const list = await api.getTutorConversations(20);
      setConversations(list);
    } catch (err) {
      console.warn("Could not fetch conversation history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadSmartSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const suggestions = await api.getTutorSuggestions();
      if (Array.isArray(suggestions)) {
        setSmartSuggestions(suggestions);
      }
    } catch (err) {
      console.warn("Could not load smart suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectConversation = async (id: string) => {
    try {
      ttsService.stop();
      setIsTyping(true);
      const conv = await api.getTutorConversation(id);
      setConversationId(conv.id);

      if (conv.messages && conv.messages.length > 0) {
        const mapped: Message[] = conv.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }));
        setMessages(mapped);
      }
      setShowHistory(false);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteConversation = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      setDeletingId(id);
      await api.deleteTutorConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        handleNewConversation();
      }
      toast.success("Chat session deleted");
    } catch (err: any) {
      console.error("Failed to delete conversation:", err);
      toast.error(err.message || "Failed to delete conversation");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllConversations = async () => {
    if (!window.confirm("Are you sure you want to delete all past chat sessions? This cannot be undone.")) {
      return;
    }
    try {
      setLoadingHistory(true);
      await api.clearAllTutorConversations();
      setConversations([]);
      handleNewConversation();
      toast.success("All chat sessions deleted");
    } catch (err: any) {
      console.error("Failed to clear conversations:", err);
      toast.error(err.message || "Failed to clear conversations");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewConversation = () => {
    ttsService.stop();
    setConversationId(null);
    setMessages([createInitialGreeting()]);
    setSuggestedActions([]);
    setInput("");
    setAttachedImage(null);
    setShowHistory(false);
    loadSmartSuggestions();
  };

  // Image Processing & Upload Handlers
  const processImageFile = (file: File) => {
    let mimeType = (file.type || "").toLowerCase().trim();
    if (!mimeType) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "jpg" || ext === "jpeg" || ext === "jfif") mimeType = "image/jpeg";
      else if (ext === "png") mimeType = "image/png";
      else if (ext === "webp") mimeType = "image/webp";
    } else if (mimeType === "image/jpg" || mimeType === "image/pjpeg") {
      mimeType = "image/jpeg";
    } else if (mimeType === "image/x-png") {
      mimeType = "image/png";
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(mimeType)) {
      toast.error("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      setAttachedImage({
        file,
        previewUrl: URL.createObjectURL(file),
        base64,
        mimeType,
      });
      toast.success("Image attached! Type any question or send directly to analyze.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    if (attachedImage?.previewUrl) {
      URL.revokeObjectURL(attachedImage.previewUrl);
    }
    setAttachedImage(null);
  };

  // Web Audio Waveform Visualization Handlers
  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setLiveVolume(0);
  };

  const startAudioVisualization = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const drawWaveform = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        setLiveVolume(Math.round(sum / bufferLength));

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = Math.max(3, (canvas.width / bufferLength) * 1.5);
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = Math.max(4, (dataArray[i] / 255) * canvas.height);
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, "#f59e0b");
          gradient.addColorStop(1, "#ea580c");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, (canvas.height - barHeight) / 2, Math.max(barWidth - 2, 2), barHeight, 3);
          } else {
            ctx.rect(x, (canvas.height - barHeight) / 2, Math.max(barWidth - 2, 2), barHeight);
          }
          ctx.fill();
          x += barWidth;
        }

        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();
    } catch (err) {
      console.warn("Could not start audio visualization:", err);
    }
  };

  // Voice STT Recording Handlers with Browser Native SpeechRecognition + Audio Fallback
  const startRecording = async () => {
    setVoiceError(null);
    setVoiceState("REQUESTING_PERMISSION");
    setLiveTranscript("");
    liveTranscriptRef.current = "";

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = "Microphone recording is not supported in this browser.";
        setVoiceError(msg);
        setVoiceState("ERROR");
        toast.error(msg);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      audioChunksRef.current = [];

      // 1. Initialize Browser Native SpeechRecognition for Real-time Streaming Words
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        try {
          const recognition = new SpeechRecognitionConstructor();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let combined = "";
            for (let i = 0; i < event.results.length; i++) {
              combined += event.results[i][0].transcript + " ";
            }
            const clean = combined.trim();
            if (clean) {
              setLiveTranscript(clean);
              liveTranscriptRef.current = clean;
            }
          };

          recognition.onerror = (e: any) => {
            console.warn("Native SpeechRecognition non-fatal event:", e?.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn("Could not start native SpeechRecognition:", recErr);
        }
      }

      // 2. Start MediaRecorder with best supported MIME type
      let mimeType = "audio/webm";
      if (typeof MediaRecorder.isTypeSupported === "function") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stopAudioVisualization();
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        // If native recognition captured words, use them!
        const capturedSpeech = (liveTranscriptRef.current || "").trim();
        if (capturedSpeech && capturedSpeech.length > 2) {
          setReviewTranscript(capturedSpeech);
          if (autoSendRef.current || voiceChatMode) {
            autoSendRef.current = false;
            handleSend(capturedSpeech, { autoSpeak: true });
            setVoiceState("IDLE");
            toast.success("Voice question sent! Listening for AI tutor reply...");
            return;
          } else {
            setInput(capturedSpeech);
            setVoiceState("IDLE");
            toast.success("Speech detected! You can edit or press send.");
            return;
          }
        }

        if (audioChunksRef.current.length === 0) {
          setVoiceState("IDLE");
          return;
        }

        const actualMime = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
        audioChunksRef.current = [];

        try {
          setVoiceState("PROCESSING");
          const result = await api.transcribeVoice(audioBlob);
          if (result && result.transcript && result.transcript.trim()) {
            const transcript = result.transcript.trim();
            setReviewTranscript(transcript);
            if (autoSendRef.current || voiceChatMode) {
              autoSendRef.current = false;
              handleSend(transcript, { autoSpeak: true });
              setVoiceState("IDLE");
              toast.success("Voice question sent! Listening for AI tutor reply...");
            } else {
              setInput(transcript);
              setVoiceState("IDLE");
              toast.success("Voice transcribed! You can edit or press send.");
            }
          } else {
            const errText = "No clear speech detected. Please speak closer to the microphone and try again.";
            setVoiceError(errText);
            setVoiceState("ERROR");
            toast.error(errText);
          }
        } catch (err: any) {
          console.error("Transcription error:", err);
          const msg = err.message || "Could not transcribe audio. You can type your question directly.";
          setVoiceError(msg);
          setVoiceState("ERROR");
          toast.error(msg);
        } finally {
          autoSendRef.current = false;
        }
      };

      mediaRecorder.start(200);
      setVoiceState("RECORDING");
      setRecordingDuration(0);
      startAudioVisualization(stream);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 59) {
            stopRecording(false);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      stopAudioVisualization();
      let errorMsg = "Microphone access denied. Please grant permission in browser settings.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Microphone access denied. Please allow microphone access in your browser address bar.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "No microphone detected on your device. Please connect a microphone.";
      }
      setVoiceError(errorMsg);
      setVoiceState("ERROR");
      toast.error(errorMsg);
    }
  };

  const stopRecording = (autoSend: boolean = false) => {
    autoSendRef.current = autoSend;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.requestData();
      } catch {}
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    autoSendRef.current = false;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    stopAudioVisualization();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setVoiceState("IDLE");
    setRecordingDuration(0);
    setVoiceError(null);
    setLiveTranscript("");
    liveTranscriptRef.current = "";
  };

  const handleSendReviewedTranscript = () => {
    if (reviewTranscript.trim()) {
      handleSend(reviewTranscript.trim(), { autoSpeak: true });
      setReviewTranscript("");
      setVoiceState("IDLE");
    }
  };

  const handleEditReviewedTranscript = () => {
    setInput((prev) => (prev ? `${prev} ${reviewTranscript.trim()}` : reviewTranscript.trim()));
    setReviewTranscript("");
    setVoiceState("IDLE");
  };

  const handleDiscardReviewedTranscript = () => {
    setReviewTranscript("");
    setVoiceState("IDLE");
  };

  // Primary Message Sender
  const handleSend = async (
    messageText?: string,
    options: { appendUser?: boolean; replaceMessageId?: string; imagePayload?: any; autoSpeak?: boolean } = {}
  ) => {
    const textToSend = (messageText !== undefined ? messageText : input).trim();
    const currentImage = options.imagePayload !== undefined ? options.imagePayload : attachedImage;

    if ((!textToSend && !currentImage) || isTyping) return;

    if (options.autoSpeak || voiceChatMode) {
      autoSpeakNextReplyRef.current = true;
    }

    const appendUser = options.appendUser ?? true;
    const assistantId = `assistant-${Date.now()}`;
    const userText = textToSend || (currentImage ? "Please analyze this image and explain the Vedic mathematics solution." : "");

    // Pre-calculate image payload before clearing state to prevent race conditions
    const imageToSend = currentImage
      ? {
          data: currentImage.base64,
          mimeType: currentImage.mimeType,
          fileName: currentImage.file?.name || "problem.png",
        }
      : undefined;

    setMessages((prev) => {
      const withoutFailed = options.replaceMessageId
        ? prev.filter((message) => message.id !== options.replaceMessageId)
        : prev;
      return appendUser
        ? [
            ...withoutFailed,
            {
              id: `user-${Date.now()}`,
              role: "user",
              content: userText,
              image: currentImage
                ? {
                    previewUrl: currentImage.previewUrl,
                    fileName: currentImage.file?.name,
                  }
                : undefined,
            },
          ]
        : withoutFailed;
    });

    if (messageText === undefined) {
      setInput("");
      setAttachedImage(null);
    }
    setIsTyping(true);
    setSuggestedActions([]);

    try {
      const response: StructuredTutorResponse = await api.sendTutorMessage({
        message: userText,
        conversationId: conversationId || undefined,
        courseId: courseIdParam ? Number(courseIdParam) : undefined,
        moduleId: moduleIdParam ? Number(moduleIdParam) : undefined,
        topicId: topicIdParam ? Number(topicIdParam) : undefined,
        image: imageToSend,
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: response.response,
          math: response.math,
          sourceRefs: response.sourceRefs,
          imageUnderstanding: response.imageUnderstanding,
        },
      ]);

      if (autoSpeakNextReplyRef.current || voiceChatMode) {
        autoSpeakNextReplyRef.current = false;
        setTimeout(() => {
          ttsService.speak(assistantId, response.response);
        }, 200);
      }

      if (Array.isArray(response.suggestedActions) && response.suggestedActions.length > 0) {
        setSuggestedActions(response.suggestedActions);
      }

      // Refresh conversations & suggestions
      loadConversationHistory();
      loadSmartSuggestions();
    } catch (err: any) {
      console.error("AI Tutor message failed:", err);
      // Preserve currentImage if request failed so user can easily retry!
      if (currentImage && !attachedImage) {
        setAttachedImage(currentImage);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content:
            err.message ||
            "I encountered an issue processing your request. Please ensure the backend is connected.",
          retryText: userText,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = (message: Message) => {
    if (!message.retryText || retryingMessageId || isTyping) return;
    setRetryingMessageId(message.id);
    void handleSend(message.retryText, { appendUser: false, replaceMessageId: message.id }).finally(() => {
      setRetryingMessageId(null);
    });
  };

  const handleActionClick = (action: string) => {
    if (action.toLowerCase().includes("practice")) {
      navigate("/practice");
    } else {
      handleSend(action);
    }
  };

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    if (suggestion.action === "PRACTICE_TOPIC") {
      if (suggestion.topicId) {
        navigate(`/practice?topicId=${suggestion.topicId}`);
      } else {
        navigate("/practice");
      }
    } else if (suggestion.action === "OPEN_TOPIC") {
      if (suggestion.topicId) {
        navigate(`/curriculum?topicId=${suggestion.topicId}`);
      } else {
        navigate("/curriculum");
      }
    } else {
      handleSend(suggestion.prompt);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen relative overflow-hidden bg-background">
        {/* Main Chat Column */}
        <div className="flex flex-1 flex-col h-full min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-saffron text-primary-foreground shadow-soft">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  VedicMind AI Tutor <Sparkles className="h-4 w-4 text-primary" />
                </h1>
                <p className="text-xs text-muted-foreground">
                  {conversationId ? `Active Session (${conversationId.slice(0, 8)}...)` : "Live Multimodal Socratic Math Mentor"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Chat Reply Mode Toggle */}
              <Button
                type="button"
                onClick={() => {
                  const next = !voiceChatMode;
                  setVoiceChatMode(next);
                  toast.success(
                    next
                      ? "Voice Chat Mode enabled: AI tutor will speak replies aloud! 🔊"
                      : "Voice Chat Mode disabled: Text replies only."
                  );
                }}
                size="sm"
                variant={voiceChatMode ? "default" : "outline"}
                className={`text-xs font-semibold rounded-xl transition-all h-8 px-3 ${
                  voiceChatMode
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs"
                    : "border-border text-muted-foreground hover:border-amber-400"
                }`}
                title="When active, AI speaks responses aloud automatically"
              >
                {voiceChatMode ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 mr-1.5 animate-pulse text-white" />
                    <span>Voice Chat: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 mr-1.5" />
                    <span>Voice Chat: OFF</span>
                  </>
                )}
              </Button>

              {/* Active TTS Player Status pill */}
              {ttsState.isPlaying && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-700 dark:text-amber-300 animate-pulse">
                  <Radio className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                  <span>Speaking...</span>
                  <button
                    type="button"
                    onClick={() => ttsService.stop()}
                    className="ml-1 text-[11px] underline hover:text-destructive"
                  >
                    Mute
                  </button>
                </div>
              )}

              {conversationId && (
                <Button
                  onClick={() => handleDeleteConversation(conversationId)}
                  size="sm"
                  variant="outline"
                  disabled={deletingId === conversationId}
                  className="text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                  title="Delete this active chat session"
                >
                  {deletingId === conversationId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 mr-1.5 text-destructive" />
                  )}
                  Delete Chat
                </Button>
              )}
              <Button
                onClick={handleNewConversation}
                size="sm"
                variant="outline"
                className="text-xs font-semibold"
                title="Start a new conversation"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" /> New Session
              </Button>
              <Button
                onClick={() => setShowHistory(!showHistory)}
                size="sm"
                variant="ghost"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                title="View previous conversations"
              >
                <History className="h-4 w-4 mr-1.5" /> History
              </Button>
            </div>
          </div>

          {/* Context Banner if opened from a specific topic/lesson */}
          {(topicIdParam || lessonIdParam) && (
            <div className="border-b border-primary/20 bg-primary/5 px-6 py-2 flex items-center justify-between text-xs text-primary font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Context-Aware Session: Linked to active Vedic lesson
              </span>
              <span className="text-[10px] text-muted-foreground">Tutor has curriculum context</span>
            </div>
          )}

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-saffron text-primary-foreground shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm shadow-soft ${
                    msg.role === "user"
                      ? "gradient-saffron text-primary-foreground font-medium rounded-tr-none"
                      : "bg-card border border-border text-foreground rounded-tl-none leading-relaxed"
                  }`}
                >
                  {/* User Uploaded Image Preview in Bubble */}
                  {msg.image && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-primary-foreground/20 max-w-sm shadow-sm">
                      <img
                        src={msg.image.previewUrl}
                        alt={msg.image.fileName || "Uploaded math work"}
                        className="max-h-60 w-auto object-contain rounded-lg bg-black/20"
                      />
                      {msg.image.fileName && (
                        <div className="px-2 py-1 text-[11px] opacity-90 truncate bg-black/30 font-mono">
                          📷 {msg.image.fileName}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Structured AI Vision Diagnosis Badge */}
                  {msg.imageUnderstanding && (
                    <div className="mb-3.5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold flex items-center gap-1.5 text-primary">
                          <Sparkles className="h-3.5 w-3.5" /> Vedic AI Vision Diagnosis
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            msg.imageUnderstanding.confidence === "high"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : msg.imageUnderstanding.confidence === "medium"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          }`}
                        >
                          Confidence: {msg.imageUnderstanding.confidence}
                        </span>
                      </div>

                      {msg.imageUnderstanding.mathematicalExpression && (
                        <div className="my-1.5 p-2 bg-card rounded-lg border border-border font-mono text-xs text-foreground flex items-center justify-between">
                          <span>
                            Expression:{" "}
                            <strong className="text-primary">
                              {msg.imageUnderstanding.mathematicalExpression}
                            </strong>
                          </span>
                          {msg.imageUnderstanding.detectedSutra && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              Sutra: {msg.imageUnderstanding.detectedSutra}
                            </span>
                          )}
                        </div>
                      )}

                      {msg.imageUnderstanding.requiresClarification && (
                        <div className="mt-1.5 text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-1 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            Some parts of this image were ambiguous. You can reply with clarification if needed.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {msg.retryText && (
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                      <span className="text-xs text-destructive">The tutor could not generate a response.</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isTyping || retryingMessageId === msg.id}
                        onClick={() => handleRetry(msg)}
                        className="text-xs"
                      >
                        {retryingMessageId === msg.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Try Again"}
                      </Button>
                    </div>
                  )}

                  {/* Math Feedback Badge if provided */}
                  {msg.math && msg.math.expression && (
                    <div className="mt-3 rounded-lg bg-muted/40 p-2 text-xs font-mono border border-border flex items-center justify-between">
                      <span>Expression: {msg.math.expression}</span>
                      {msg.math.isCorrect !== undefined && (
                        <span className={msg.math.isCorrect ? "text-accent font-bold" : "text-destructive font-bold"}>
                          {msg.math.isCorrect ? "✓ Verified" : "✗ Discrepancy"}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Source References Pills */}
                  {Array.isArray(msg.sourceRefs) && msg.sourceRefs.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border/40 pt-2">
                      {msg.sourceRefs.map((ref, rIdx) => (
                        <span
                          key={rIdx}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                        >
                          📜 {ref.sutra || ref.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Text-To-Speech (TTS) Controls for Assistant Messages */}
                  {msg.role === "assistant" && (
                    <div className="mt-3 flex items-center gap-2 border-t border-border/50 pt-2.5">
                      <button
                        type="button"
                        onClick={() => ttsService.speak(msg.id, msg.content)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          ttsState.currentMessageId === msg.id && ttsState.isPlaying
                            ? "bg-primary text-primary-foreground shadow-sm animate-pulse"
                            : ttsState.currentMessageId === msg.id && ttsState.isPaused
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        title="Listen to this explanation with natural Vedic math pronunciation"
                      >
                        {ttsState.currentMessageId === msg.id ? (
                          ttsState.isPlaying ? (
                            <>
                              <Pause className="h-3.5 w-3.5" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              <span>Resume</span>
                            </>
                          )
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>

                      {ttsState.currentMessageId === msg.id && (
                        <button
                          type="button"
                          onClick={() => ttsService.stop()}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          title="Stop audio playback"
                        >
                          <Square className="h-3 w-3" />
                          <span>Stop</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}

            {messages.length === 1 && messages[0].id === "initial-greeting" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="ml-11 max-w-2xl mt-2 space-y-2.5 pb-2"
              >
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Quick Vedic Starter Inquiries:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleSend("Explain Nikhilam base multiplication with numbers near 100 like 98 × 97.")}
                    className="p-3 text-left rounded-xl border border-primary/20 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-2 font-display text-xs font-bold text-foreground group-hover:text-primary">
                      <span>⚡</span> Nikhilam Base 100 Method
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Multiply numbers near 100 in 2 seconds without longhand.</p>
                  </button>
                  <button
                    onClick={() => handleSend("How does Ekadhikena Purvena instantly square numbers ending in 5 like 85²?")}
                    className="p-3 text-left rounded-xl border border-amber-500/20 bg-card hover:bg-amber-500/5 hover:border-amber-500/40 transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-2 font-display text-xs font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      <span>🔢</span> Instant Squaring of ...5
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">By one more than the previous: compute 85² = 7225 mentally.</p>
                  </button>
                  <button
                    onClick={() => handleSend("Teach me the Urdhva Tiryagbhyam criss-cross method for universal 2-digit multiplication.")}
                    className="p-3 text-left rounded-xl border border-emerald-500/20 bg-card hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-2 font-display text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      <span>✖️</span> Urdhva Tiryagbhyam
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Universal crosswise multiplication for any two numbers.</p>
                  </button>
                  <button
                    onClick={() => handleSend("What is the Vedic dot (Shudh) method for rapid columnar addition?")}
                    className="p-3 text-left rounded-xl border border-purple-500/20 bg-card hover:bg-purple-500/5 hover:border-purple-500/40 transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-2 font-display text-xs font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      <span>➕</span> Shudh Dot Column Addition
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Add large columns by dropping 10s with dots.</p>
                  </button>
                </div>
              </motion.div>
            )}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-saffron text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-muted-foreground ml-2">Vedic Tutor is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>



          {/* Attached Image Preview Pill */}
          {attachedImage && (
            <div className="border-t border-border bg-muted/30 px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg overflow-hidden border border-border bg-black/20 shrink-0">
                  <img
                    src={attachedImage.previewUrl}
                    alt="Attached preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-foreground truncate max-w-xs">
                    {attachedImage.file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {(attachedImage.file.size / 1024).toFixed(1)} KB • Image ready for multimodal analysis
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleRemoveImage}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Chat Composer Bar */}
          <div className="border-t border-border bg-card p-4">
            {/* Voice STT State UI */}
            {voiceState === "REQUESTING_PERMISSION" ? (
              <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-soft">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs font-medium text-primary">
                    Requesting microphone access from browser...
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={cancelRecording}
                  className="text-xs text-muted-foreground hover:text-foreground h-8 px-3"
                >
                  Cancel
                </Button>
              </div>
            ) : voiceState === "RECORDING" ? (
              <div className="flex flex-col gap-3.5 max-w-4xl mx-auto rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4 sm:p-5 shadow-xl backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-destructive"></span>
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-destructive flex items-center gap-1.5 whitespace-nowrap">
                      <span>Listening...</span>
                      <span className="font-mono bg-destructive/15 px-2 py-0.5 rounded text-xs">
                        {formatSeconds(recordingDuration)} / 01:00
                      </span>
                    </span>

                    {/* Dynamic Soundwave Equalizer Bars */}
                    <div className="flex items-center gap-1 h-6 px-1.5">
                      {[14, 22, 28, 18, 24].map((h, idx) => (
                        <span
                          key={idx}
                          className="w-1 rounded-full bg-gradient-to-t from-amber-500 to-orange-500 transition-all duration-75"
                          style={{
                            height: `${Math.max(4, Math.min(24, (liveVolume / 255) * h * 1.5 + 4))}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Live Web Audio Waveform Canvas */}
                  <div className="hidden sm:flex items-center gap-2">
                    <canvas
                      ref={canvasRef}
                      width={240}
                      height={32}
                      className="rounded-lg bg-card/85 border border-amber-500/30 shadow-xs"
                      title="Live audio input amplitude waveform"
                    />
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={cancelRecording}
                      className="text-xs text-muted-foreground hover:text-foreground h-9 px-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => stopRecording(true)}
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white text-xs font-bold flex items-center gap-1.5 h-9 px-4 shadow-md shadow-orange-500/25 transition-all"
                    >
                      <Send className="h-3.5 w-3.5" /> Send Voice Question
                    </Button>
                  </div>
                </div>
              </div>
            ) : voiceState === "PROCESSING" ? (
              <div className="flex items-center justify-center gap-2.5 max-w-4xl mx-auto rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-soft">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-medium text-primary">
                  Transcribing speech with Whisper / AI...
                </span>
              </div>
            ) : voiceState === "REVIEWING" ? (
              <div className="max-w-4xl mx-auto rounded-xl border border-primary/30 bg-card p-4 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Mic className="h-4 w-4" />
                    <span>Voice Transcript Review</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Review before submitting to DWANDA AI
                  </span>
                </div>
                <div className="rounded-lg bg-muted/30 border border-border p-3 text-sm text-foreground italic">
                  "{reviewTranscript}"
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleDiscardReviewedTranscript}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 h-8 px-3"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Discard
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleEditReviewedTranscript}
                    className="text-xs flex items-center gap-1.5 h-8 px-3 border-border hover:bg-muted"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit in Box
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSendReviewedTranscript}
                    className="gradient-saffron text-primary-foreground text-xs font-semibold flex items-center gap-1.5 h-8 px-4 shadow-soft"
                  >
                    <Send className="h-3.5 w-3.5" /> Send to Tutor
                  </Button>
                </div>
              </div>
            ) : voiceState === "ERROR" ? (
              <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 shadow-soft">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium">
                    {voiceError || "Microphone or transcription failed."}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setVoiceError(null);
                      setVoiceState("IDLE");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
                  >
                    Dismiss
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={startRecording}
                    className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-1 h-8 px-3"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 max-w-4xl mx-auto"
              >
                {/* Hidden File Input for Multimodal Image Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Multimodal Image Button */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping}
                  className="h-12 w-12 p-0 rounded-xl border-border bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 shadow-soft"
                  title="Upload photo or screenshot of math problem"
                >
                  <Camera className="h-5 w-5" />
                </Button>

                {/* Voice Input Button */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={startRecording}
                  disabled={isTyping || voiceState !== "IDLE"}
                  className="h-12 w-12 p-0 rounded-xl border-border bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 shadow-soft"
                  title="Record your question with voice"
                >
                  <Mic className="h-5 w-5" />
                </Button>

                {/* Text Input Box */}
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    attachedImage
                      ? "Add a question about this image, or press Send to analyze..."
                      : "Ask about a Vedic sutra, problem, or mental shortcut (e.g. 'How do I multiply 98 × 97?')..."
                  }
                  disabled={isTyping}
                  className="flex-1 rounded-xl border-border bg-muted/20 text-sm focus:border-primary shadow-soft h-12"
                />

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={(!input.trim() && !attachedImage) || isTyping}
                  className="gradient-saffron text-primary-foreground font-semibold rounded-xl h-12 px-6 shadow-soft shrink-0"
                >
                  {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Conversation History Drawer */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 border-l border-border bg-card p-4 shadow-xl z-20 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border mb-3">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" /> Previous Sessions
                </h3>
                <Button
                  onClick={() => setShowHistory(false)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleNewConversation}
                size="sm"
                className="w-full mb-3 text-xs gradient-saffron text-primary-foreground font-semibold"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Start New Session
              </Button>

              <div className="flex-1 overflow-y-auto space-y-2">
                {loadingHistory ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto mb-2" />
                    Loading history...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground italic">
                    No past sessions found. Your conversations will be saved here automatically!
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group relative flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                        conversationId === conv.id
                          ? "bg-primary/10 border-primary text-foreground font-semibold"
                          : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectConversation(conv.id)}
                        className="flex-1 text-left min-w-0 pr-2"
                      >
                        <div className="truncate font-medium text-foreground mb-1">
                          {conv.title || "Vedic Mathematics Session"}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                          <span>{new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={deletingId === conv.id}
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/15 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                        title="Delete conversation"
                      >
                        {deletingId === conv.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {conversations.length > 0 && (
                <div className="pt-3 border-t border-border mt-2">
                  <Button
                    onClick={handleClearAllConversations}
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear All Past Sessions
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
