import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SttTranscriptionResult {
  transcript: string;
  language: string;
  durationMs: number;
}

export interface UploadedAudio {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);
  private readonly whisperUrl: string | undefined;
  private readonly whisperApiKey: string | undefined;
  private readonly maxFileSizeBytes = 10 * 1024 * 1024; // 10MB

  private readonly allowedMimeTypes = new Set([
    'audio/webm',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'audio/vorbis',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
    'audio/aac',
    'application/octet-stream', // Fallback for raw browser streams
  ]);

  constructor(private readonly configService: ConfigService) {
    this.whisperUrl =
      this.configService.get<string>('WHISPER_SERVICE_URL') ||
      this.configService.get<string>('WHISPER_API_URL');
    this.whisperApiKey = this.configService.get<string>('WHISPER_API_KEY');
  }

  /**
   * Validates and transcribes uploaded audio.
   * Cleans up temporary resources with zero permanent audio storage.
   */
  async transcribeAudio(file: UploadedAudio): Promise<SttTranscriptionResult> {
    const startTime = Date.now();

    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('No audio file provided or audio buffer is empty.');
    }

    const effectiveSize = file.size || file.buffer.length;
    if (effectiveSize > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `Audio file exceeds 10MB limit (received ${(effectiveSize / (1024 * 1024)).toFixed(1)}MB).`,
      );
    }

    const mime = file.mimetype.toLowerCase();
    if (!this.allowedMimeTypes.has(mime) && !mime.startsWith('audio/')) {
      throw new BadRequestException(
        `Unsupported audio format '${file.mimetype}'. Supported formats: WebM, WAV, MP3, OGG, M4A.`,
      );
    }

    // Minimal size check: Allow short spoken phrases
    if (file.buffer.length < 300) {
      throw new BadRequestException(
        'Audio clip was too short. Please speak clearly into your microphone and try again.',
      );
    }

    // Estimate duration from buffer size (approximate for typical voice bitrates ~64kbps)
    const estimatedDurationMs = Math.max(1000, Math.round((file.size / 8000) * 1000));

    // 1. If external/local Whisper service URL is configured
    if (this.whisperUrl) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
        formData.append('file', blob, file.originalname || 'speech.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');

        const headers: Record<string, string> = {};
        if (this.whisperApiKey) {
          headers['Authorization'] = `Bearer ${this.whisperApiKey}`;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);

        const response = await fetch(this.whisperUrl, {
          method: 'POST',
          headers,
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Whisper HTTP error ${response.status}: ${errText}`);
        }

        const data = (await response.json()) as any;
        const transcript = (data.text || data.transcript || '').trim();

        if (transcript) {
          const cleaned = this.postprocessVedicTranscript(transcript);
          if (cleaned) {
            return {
              transcript: cleaned,
              language: data.language || 'en',
              durationMs: data.duration ? Math.round(data.duration * 1000) : estimatedDurationMs,
            };
          }
        }
      } catch (err: any) {
        this.logger.warn(`Whisper service request failed: ${err.message}. Falling back.`);
      }
    }

    // 2. Multimodal Gemini Audio Transcription fallback
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim();
    if (geminiKey && geminiKey !== '' && !geminiKey.includes('your-gemini-api-key')) {
      const candidateModels = [
        this.configService.get<string>('AI_MODEL_NAME') || 'gemini-2.5-flash',
        'gemini-2.5-flash',
      ];

      for (const modelName of candidateModels) {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const ai = new GoogleGenerativeAI(geminiKey);
          const model = ai.getGenerativeModel({
            model: modelName,
            generationConfig: { temperature: 0.1 },
          });
          const audioBase64 = file.buffer.toString('base64');
          const rawMime = file.mimetype.startsWith('audio/') ? file.mimetype : 'audio/webm';
          // Normalize mime type for Gemini
          const mimeType = rawMime.includes('webm')
            ? 'audio/webm'
            : rawMime.includes('wav')
            ? 'audio/wav'
            : rawMime.includes('mp3') || rawMime.includes('mpeg')
            ? 'audio/mp3'
            : rawMime.includes('ogg')
            ? 'audio/ogg'
            : rawMime.includes('mp4') || rawMime.includes('m4a') || rawMime.includes('aac')
            ? 'audio/aac'
            : 'audio/webm';

          const result = await model.generateContent([
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: `Please transcribe the audible spoken English in this audio recording into clean text.
Return ONLY the exact transcribed words spoken by the student.
If the student asks a question about numbers, calculations, or Vedic mathematics sutras (such as Nikhilam, Ekadhikena, Anurupyena, Urdhva Tiryagbhyam, Paravartya, Yavadunam, etc.), transcribe the question accurately.
Do not include quotation marks, markdown formatting, or preamble comments.
If there is completely no speech detected in the audio, respond with NO_SPEECH.`,
            },
          ]);

          let transcribedText = result.response?.text()?.trim() || '';
          transcribedText = transcribedText.replace(/^["'`]+|["'`]+$/g, '').trim();

          if (transcribedText && !this.isSilenceOrNoSpeech(transcribedText)) {
            const cleaned = this.postprocessVedicTranscript(transcribedText);
            if (cleaned) {
              return {
                transcript: cleaned,
                language: 'en',
                durationMs: Date.now() - startTime + estimatedDurationMs,
              };
            }
          }
        } catch (geminiErr: any) {
          this.logger.warn(`Gemini audio model ${modelName} encountered: ${geminiErr.message}`);
        }
      }
    }

    // If no valid speech was heard, throw a clear exception rather than injecting a random question!
    throw new BadRequestException(
      'No clear speech was heard in the recording. Please speak directly into your microphone and try again.',
    );
  }

  /**
   * Detects whether transcription represents silence or model hallucination on empty audio.
   */
  private isSilenceOrNoSpeech(text: string): boolean {
    const normalized = text.toLowerCase().trim();
    if (!normalized || normalized === 'no_speech' || normalized === 'no speech' || normalized === 'no speech detected') {
      return true;
    }
    if (
      normalized.includes('[silence]') ||
      normalized.includes('(silence)') ||
      normalized.includes('[music]') ||
      normalized.includes('(music)') ||
      normalized.includes('thank you for watching') ||
      normalized.includes('subtitles by')
    ) {
      return true;
    }
    return false;
  }

  /**
   * Preprocesses and corrects transcribed speech for Vedic mathematics terminology and clean phrasing.
   */
  private postprocessVedicTranscript(text: string): string {
    let cleaned = text.trim();

    // Strip wrapping quotes if any
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1).trim();
    }

    // Vedic terms phonetic harmonization
    cleaned = cleaned.replace(/\b(?:eka\s*dhi\s*kena|ekadhika|eka\s*adhikena)\b/gi, 'Ekadhikena');
    cleaned = cleaned.replace(/\b(?:ekadhikena\s+purvena|ekadhikena\s+poorvena)\b/gi, 'Ekadhikena Purvena');
    cleaned = cleaned.replace(/\b(?:nikilam|nikalam|nick\s*hill\s*am|nikhilam\s*sutra|nikalam\s*sutra)\b/gi, 'Nikhilam');
    cleaned = cleaned.replace(/\b(?:anurupyena|anurupya)\b/gi, 'Anurupyena');
    cleaned = cleaned.replace(/\b(?:navatas\s*charamam|navatash\s*charamam)\b/gi, 'Navatashcaramam');
    cleaned = cleaned.replace(/\b(?:dashata|dashatha)\b/gi, 'Dashatah');
    cleaned = cleaned.replace(/\b(?:urdva|urdhwa)\s+tiryagbhyam\b/gi, 'Urdhva Tiryagbhyam');
    cleaned = cleaned.replace(/\b(?:paravartya\s+yojayet|paravartya\s+yojet)\b/gi, 'Paravartya Yojayet');
    cleaned = cleaned.replace(/\b(?:yavadun|yavadunam)\b/gi, 'Yavadunam');
    cleaned = cleaned.replace(/\b(?:shudh\s*dot|shuddha\s*method)\b/gi, 'Shudh dot method');
    cleaned = cleaned.replace(/\b(?:dwandwa|duplex\s+method)\b/gi, 'Dwandwa Yoga Duplex method');
    cleaned = cleaned.replace(/\b(?:vinculum|bar\s*number)\b/gi, 'Vinculum');

    // Remove excessive double whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }
}
