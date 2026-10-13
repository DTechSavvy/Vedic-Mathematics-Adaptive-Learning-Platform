import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { randomBytes } from 'crypto';
import { MathSolverService } from './math-solver.service';
import { MathVerificationResult } from '../interfaces/math-verification.interface';

export interface ImageInputPayload {
  data: string; // Base64 encoded image string
  mimeType: string;
  fileName?: string;
}

export interface StructuredImageUnderstanding {
  correlationId: string;
  isImageReadable: boolean;
  containsMathematics: boolean;
  isVedicMathRelevant: boolean;
  detectedContentType:
    | 'handwritten_question'
    | 'printed_question'
    | 'worked_solution'
    | 'diagram'
    | 'notes'
    | 'unrelated';
  detectedTopic: string | null;
  detectedSutra: string | null;
  extractedText: string;
  mathematicalExpression: string | null;
  confidence: 'high' | 'medium' | 'low';
  ambiguities: string[];
  requiresClarification: boolean;
  unreadableReason?: string | null;
  processingDurationMs: number;
}

export interface ImageAnalysisResult {
  understanding: StructuredImageUnderstanding;
  isOffTopic: boolean;
  guardrailResponse?: string;
  mathVerification: MathVerificationResult | null;
  matchedTopicId?: number;
  matchedSutraId?: string;
  suggestedPrompt?: string;
}

@Injectable()
export class ImageAnalysisService {
  private readonly logger = new Logger(ImageAnalysisService.name);
  private client: GoogleGenerativeAI | null = null;
  private readonly primaryModel: string;
  private readonly fallbackModels = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly mathSolverService: MathSolverService,
  ) {
    const rawKey = this.configService.get<string>('GEMINI_API_KEY');
    const apiKey = rawKey ? rawKey.trim() : undefined;
    this.primaryModel =
      this.configService.get<string>('AI_MODEL_NAME') || 'gemini-2.5-flash';

    if (apiKey && apiKey !== '' && !apiKey.includes('your-gemini-api-key')) {
      try {
        this.client = new GoogleGenerativeAI(apiKey);
        this.logger.log(
          `ImageAnalysisService initialized with model: ${this.primaryModel}`,
        );
      } catch (err: unknown) {
        this.logger.warn(`Failed to init Gemini for image analysis: ${err}`);
      }
    }
  }

  /**
   * Validate incoming image payload: MIME, buffer size, Base64 integrity
   */
  validateImage(image: ImageInputPayload): {
    cleanBase64: string;
    mimeType: string;
    byteSize: number;
  } {
    if (!image || !image.data) {
      throw new BadRequestException('Image data payload is required.');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const mimeType = (image.mimeType || 'image/png').toLowerCase().trim();

    if (!allowedMimes.includes(mimeType)) {
      throw new BadRequestException(
        `Unsupported image MIME type: ${image.mimeType}. Allowed formats: JPEG, PNG, WebP.`,
      );
    }

    let cleanBase64 = image.data;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    }
    cleanBase64 = cleanBase64.trim().replace(/\s+/g, '');

    const buffer = Buffer.from(cleanBase64, 'base64');
    const byteSize = buffer.length;

    if (byteSize < 40) {
      throw new BadRequestException(
        'The uploaded image file appears empty or corrupted.',
      );
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (byteSize > maxSizeBytes) {
      throw new BadRequestException(
        `Image file size (${(byteSize / 1024 / 1024).toFixed(1)} MB) exceeds the 5MB maximum limit.`,
      );
    }

    return { cleanBase64, mimeType, byteSize };
  }

  /**
   * Run structured multimodal extraction pipeline using Gemini with JSON schema
   */
  async extractImageUnderstanding(
    image: ImageInputPayload,
    userTextPrompt?: string,
  ): Promise<StructuredImageUnderstanding> {
    const correlationId = `img_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const startTime = Date.now();

    const { cleanBase64, mimeType, byteSize } = this.validateImage(image);

    this.logger.log(
      `[ImageOCR: ${correlationId}] Starting structured multimodal extraction (MIME: ${mimeType}, Size: ${byteSize} bytes)`,
    );

    if (!this.client) {
      throw new BadRequestException(
        'Multimodal AI provider is not available. Please ensure GEMINI_API_KEY is configured.',
      );
    }

    const extractionPrompt = `You are an expert mathematical OCR, handwriting recognizer, and Vedic Mathematics specialist.
Analyze the uploaded image with extreme precision and output ONLY a valid JSON object matching this schema:
{
  "isImageReadable": boolean,
  "containsMathematics": boolean,
  "isVedicMathRelevant": boolean,
  "detectedContentType": "handwritten_question" | "printed_question" | "worked_solution" | "diagram" | "notes" | "unrelated",
  "detectedTopic": string | null,
  "detectedSutra": string | null,
  "extractedText": string,
  "mathematicalExpression": string | null,
  "confidence": "high" | "medium" | "low",
  "ambiguities": string[],
  "requiresClarification": boolean,
  "unreadableReason": string | null
}

STRICT INSTRUCTIONS:
1. EXTRACT ONLY WHAT IS GENUINELY VISIBLE IN THE IMAGE. DO NOT invent unreadable numbers, signs, or intermediate calculation steps.
2. If the image is blurry, cropped, or partially illegible:
   - Mark requiresClarification: true
   - In extractedText, transcribe only the unambiguously legible portion
   - In ambiguities, list which symbols/digits could not be determined with certainty
   - Set confidence to "medium" or "low"
3. If the image contains non-mathematical subjects (e.g. photos of people, animals, landscapes, everyday objects, recipes, unrelated documents):
   - Set containsMathematics: false
   - Set isVedicMathRelevant: false
   - Set detectedContentType: "unrelated"
   - Set mathematicalExpression: null
4. If mathematics is present:
   - Identify the primary calculation or equation
   - Normalize mathematicalExpression into a clean, computable string (e.g. "98 * 97", "85^2", "1/2 + 3/4", "104 * 106", "35^2", "2x^2 + 5x + 2 = 0")
   - If handwritten student work is visible, transcribe both the problem and the student's written steps/answer
5. Detect Vedic Mathematics techniques when applicable:
   - Nikhilam (base multiplication, subtraction from powers of 10)
   - Urdhva-Tiryagbhyam (criss-cross multiplication, fraction arithmetic)
   - Ekadhikena Purvena (squares ending in 5, series of 1s)
   - Ekanyunena Purvena (multiplication by 9s)
   - Dwandwa Yoga (Duplex squaring and square roots)
   - Yavadunam (cubing and base squaring)
   - Paravartya Yojayet (division by transposition)
   - Baudhayana / Shulbasutras (Pythagorean triples, circle/square, √2)
   - Adyamadyena (quadratic polynomial factorization)
${userTextPrompt ? `\nStudent added note: "${userTextPrompt}"` : ''}

Output strictly raw JSON without markdown code fences or conversational text.`;

    // Attempt with primary model, then fallbacks
    const candidateModels = [
      this.primaryModel,
      ...this.fallbackModels.filter((m) => m !== this.primaryModel),
    ];

    let lastError: unknown;
    for (const modelName of candidateModels) {
      try {
        const model = this.client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
        });

        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType,
                  },
                },
                { text: extractionPrompt },
              ],
            },
          ],
        });

        const rawText = result.response.text();
        const parsed = this.parseJsonSafely(rawText);

        const duration = Date.now() - startTime;
        this.logger.log(
          `[ImageOCR: ${correlationId}] Completed using model ${modelName} in ${duration}ms (Math: ${parsed.containsMathematics}, Type: ${parsed.detectedContentType})`,
        );

        return {
          correlationId,
          isImageReadable: Boolean(parsed.isImageReadable),
          containsMathematics: Boolean(parsed.containsMathematics),
          isVedicMathRelevant: Boolean(parsed.isVedicMathRelevant),
          detectedContentType: parsed.detectedContentType || 'unrelated',
          detectedTopic: parsed.detectedTopic || null,
          detectedSutra: parsed.detectedSutra || null,
          extractedText: parsed.extractedText || '',
          mathematicalExpression: parsed.mathematicalExpression || null,
          confidence: parsed.confidence || 'medium',
          ambiguities: Array.isArray(parsed.ambiguities)
            ? parsed.ambiguities.map(String)
            : [],
          requiresClarification: Boolean(parsed.requiresClarification),
          unreadableReason: parsed.unreadableReason || null,
          processingDurationMs: duration,
        };
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `[ImageOCR: ${correlationId}] Model ${modelName} failed: ${msg}. Trying next fallback...`,
        );
      }
    }

    throw new BadRequestException(
      `Could not analyze image with AI model: ${lastError instanceof Error ? lastError.message : 'Unknown provider error'}`,
    );
  }

  /**
   * Complete image understanding pipeline: OCR extraction + domain guardrail + math verification
   */
  async analyzeAndVerifyImage(
    image: ImageInputPayload,
    userTextPrompt?: string,
  ): Promise<ImageAnalysisResult> {
    const understanding = await this.extractImageUnderstanding(
      image,
      userTextPrompt,
    );

    // 1. Domain Guardrail check: Is it unrelated or non-mathematical?
    if (
      !understanding.containsMathematics ||
      understanding.detectedContentType === 'unrelated'
    ) {
      return {
        understanding,
        isOffTopic: true,
        guardrailResponse:
          'I can help analyze mathematical questions and Vedic Mathematics learning material. This image does not appear to contain a relevant mathematical problem. Please upload a Vedic Mathematics question, worked solution, or related learning note.',
        mathVerification: null,
      };
    }

    // 2. Unreadable or Ambiguous check
    if (
      !understanding.isImageReadable ||
      understanding.requiresClarification
    ) {
      const partialText = understanding.extractedText
        ? `I could only clearly read: **${understanding.extractedText}**.`
        : 'The writing or symbols in the image are blurry or partially obscured.';
      const ambiguityNotes =
        understanding.ambiguities.length > 0
          ? ` Unclear portions: ${understanding.ambiguities.join(', ')}.`
          : '';

      return {
        understanding,
        isOffTopic: false,
        guardrailResponse: `${partialText}${ambiguityNotes} To ensure complete mathematical accuracy, please upload a clearer, well-lit photo or type the specific equation in the chat.`,
        mathVerification: null,
      };
    }

    // 3. Mathematical Verification: verify extracted expression deterministically
    let mathVerification: MathVerificationResult | null = null;
    if (understanding.mathematicalExpression) {
      try {
        mathVerification = this.mathSolverService.verify(
          understanding.mathematicalExpression,
          undefined,
        );
      } catch (err) {
        this.logger.debug(
          `Deterministic solver skipped for expression "${understanding.mathematicalExpression}": ${err}`,
        );
      }
    }

    // 4. Grounding: Map detected topic/sutra to canonical system
    const { matchedTopicId, matchedSutraId } =
      this.matchCanonicalCurriculum(understanding);

    return {
      understanding,
      isOffTopic: false,
      mathVerification,
      matchedTopicId,
      matchedSutraId,
    };
  }

  /**
   * Map detected topic and sutra strings to canonical DB topic IDs and sutra IDs
   */
  private matchCanonicalCurriculum(
    understanding: StructuredImageUnderstanding,
  ): { matchedTopicId?: number; matchedSutraId?: string } {
    const textToSearch = `${understanding.detectedTopic || ''} ${understanding.detectedSutra || ''} ${understanding.extractedText || ''}`.toLowerCase();

    // Canonical Topic Mapping (Topics 1 to 23)
    const topicKeywords: { id: number; keywords: string[] }[] = [
      { id: 5, keywords: ['without carry', 'left to right addition', 'addition without carrying'] },
      { id: 6, keywords: ['dot method', 'rekha sthana', 'columnar sum', 'dot addition'] },
      { id: 7, keywords: ['nikhilam subtraction', 'all from 9', 'last from 10', 'subtraction complement'] },
      { id: 8, keywords: ['fraction addition', 'add fractions', 'crosswise fraction'] },
      { id: 9, keywords: ['fraction subtraction', 'subtract fractions'] },
      { id: 10, keywords: ['base method multiplication', 'nikhilam multiplication', 'base 100', 'base 10', 'deficiency multiplication'] },
      { id: 11, keywords: ['urdhva', 'vertical and crosswise', 'criss cross multiplication'] },
      { id: 12, keywords: ['series of 1', 'multiply by 11', 'multiplication by 11', '111'] },
      { id: 13, keywords: ['series of 9', 'multiply by 99', 'ekanyunena'] },
      { id: 14, keywords: ['vinculum division', 'paravartya', 'transposition division'] },
      { id: 15, keywords: ['base square', 'yavadunam square', 'square near base'] },
      { id: 16, keywords: ['square ending in 5', 'ending in 5', 'ekadhikena square'] },
      { id: 17, keywords: ['dwandwa', 'duplex', 'square root duplex'] },
      { id: 18, keywords: ['square root of 2', 'baudhayana root 2'] },
      { id: 19, keywords: ['yavadunam cube', 'cubing near base'] },
      { id: 20, keywords: ['quadratic', 'adyamadyena', 'factoring quadratic'] },
      { id: 21, keywords: ['baudhayana theorem', 'pythagorean', 'rope geometry'] },
      { id: 22, keywords: ['circling a square', 'mandala parivartana'] },
      { id: 23, keywords: ['concept of pi', 'katapayadi', 'aryabhata pi'] },
    ];

    let matchedTopicId: number | undefined;
    for (const item of topicKeywords) {
      if (item.keywords.some((k) => textToSearch.includes(k))) {
        matchedTopicId = item.id;
        break;
      }
    }

    // Canonical Sutra Mapping
    const sutraKeywords: { id: string; keywords: string[] }[] = [
      { id: 'sutra-01', keywords: ['ekadhikena purvena', 'ekadhikena'] },
      { id: 'sutra-02', keywords: ['nikhilam navatashcaramam dashatah', 'nikhilam'] },
      { id: 'sutra-03', keywords: ['urdhva tiryagbhyam', 'urdhva-tiryagbhyam', 'urdhva'] },
      { id: 'sutra-04', keywords: ['paravartya yojayet', 'paravartya'] },
      { id: 'sutra-05', keywords: ['shunyam samyasamuccaye', 'samyasamuccaye'] },
      { id: 'sutra-06', keywords: ['anurupyena'] },
      { id: 'sutra-07', keywords: ['sankalana vyavakalanabhyam'] },
      { id: 'sutra-08', keywords: ['puranapuranabhyam'] },
      { id: 'sutra-09', keywords: ['calana kalanabhyam'] },
      { id: 'sutra-10', keywords: ['yavadunam'] },
      { id: 'sutra-11', keywords: ['vyashtisamashthi'] },
      { id: 'sutra-12', keywords: ['seshanyankena charamena'] },
      { id: 'sutra-13', keywords: ['sopantyadvayamantyam'] },
      { id: 'sutra-14', keywords: ['ekanyunena purvena', 'ekanyunena'] },
      { id: 'sutra-15', keywords: ['gunitasamuccayah'] },
      { id: 'sutra-16', keywords: ['gunakasamuccayah'] },
    ];

    let matchedSutraId: string | undefined;
    for (const item of sutraKeywords) {
      if (item.keywords.some((k) => textToSearch.includes(k))) {
        matchedSutraId = item.id;
        break;
      }
    }

    return { matchedTopicId, matchedSutraId };
  }

  private parseJsonSafely(raw: string): any {
    let clean = raw.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    try {
      return JSON.parse(clean);
    } catch {
      // Attempt regex extraction of first JSON object
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error(`Invalid JSON returned by multimodal model: ${clean.slice(0, 100)}`);
    }
  }
}
