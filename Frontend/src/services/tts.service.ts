/**
 * VedicMind Text-To-Speech (TTS) Service
 * Free-tier production-grade speech synthesis with Math-Aware Phonetic Normalization.
 */

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentMessageId: string | null;
}

/**
 * Dictionary mapping common educational, mathematical, and emotional emojis
 * to natural, articulate spoken English phrases for the speech synthesizer.
 */
const EMOJI_SPEECH_MAP: Record<string, string> = {
  "🙏": "Namaste, ",
  "🕉️": "Aum, ",
  "🕉": "Aum, ",
  "🎯": "Target: ",
  "👏": "Great job, ",
  "💡": "Insight: ",
  "✨": "Notice: ",
  "🚀": "Fast shortcut: ",
  "📚": "Lesson note: ",
  "🧠": "Mental math: ",
  "🔢": "Numbers: ",
  "➕": " plus ",
  "➖": " minus ",
  "✖️": " times ",
  "✕": " times ",
  "➗": " divided by ",
  "❓": "Question: ",
  "❗": "Important: ",
  "🔍": "Let us examine: ",
  "📝": "Notice: ",
  "🏆": "Achievement: ",
  "⭐": "Star: ",
  "🌟": "Shining star: ",
  "🔥": "On a streak, ",
  "🎉": "Celebration, ",
  "🎊": "Congratulations, ",
  "👍": "Well done, ",
  "✍️": "Step to note: ",
  "📸": "Attached photo: ",
  "📷": "Attached photo: ",
  "🎙️": "Voice input: ",
  "🤖": "AI Tutor: ",
  "🔑": "Core rule: ",
  "📌": "Key point: ",
  "🛡️": "Protection: ",
  "💎": "Wisdom stone: ",
  "🥇": "First place, ",
  "🥈": "Second place, ",
  "🥉": "Third place, ",
  "😊": "Happy learning, ",
  "😃": "Great, ",
  "😄": "Excellent, ",
  "😁": "Wonderful, ",
  "😉": "Quick trick, ",
  "🙌": "Great work, ",
  "💪": "Keep sharp, ",
  "⏱️": "Timer: ",
  "⏰": "Time: ",
  "📊": "Progress: ",
  "📈": "Growth: ",
  "✅": "Correct, ",
  "❌": "Incorrect, ",
  "⚠️": "Caution, ",
};

/**
 * Replaces emojis in text with natural spoken words so the speech synthesizer
 * articulates them clearly rather than skipping or stuttering.
 */
function replaceEmojisForSpeech(text: string): string {
  let result = text;
  for (const [emoji, spoken] of Object.entries(EMOJI_SPEECH_MAP)) {
    result = result.split(emoji).join(` ${spoken} `);
  }
  // For any remaining unmapped emojis or symbols, replace with a natural pause comma
  result = result.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ", ");
  return result;
}

/**
 * Converts mathematical formulas, LaTeX markup, emojis, contractions, and Vedic notation
 * into clean, articulate, pronounceable English speech without rushing, stuttering, or repeating words.
 */
export function normalizeMathForSpeech(text: string): string {
  if (!text) return "";

  let speakable = text;

  // 1. Convert emojis to natural spoken English words
  speakable = replaceEmojisForSpeech(speakable);

  // 2. Remove markdown code blocks but extract content
  speakable = speakable.replace(/```[\s\S]*?```/g, " ");
  speakable = speakable.replace(/`([^`]+)`/g, "$1");

  // 3. Expand English contractions & phonetic symbols so speech engines pronounce them sharply and naturally
  // Replace AI with "Ay-Eye" so engines pronounce it clearly as letters A-I rather than "dot" or weird vowels
  speakable = speakable.replace(/\bAI\b/g, "Ay-Eye");
  speakable = speakable.replace(/\bA\.I\.\b/g, "Ay-Eye");
  speakable = speakable.replace(/\bai\b/g, "Ay-Eye");

  // Replace Roman numeral I / standalone I with "Eye" so speech engines never say "one"
  speakable = speakable.replace(/\bI['’]m\b/g, "Eye am");
  speakable = speakable.replace(/\bI['’]ll\b/g, "Eye will");
  speakable = speakable.replace(/\bI['’]ve\b/g, "Eye have");
  speakable = speakable.replace(/\bI['’]d\b/g, "Eye would");
  speakable = speakable.replace(/\bI\s+am\b/g, "Eye am");
  speakable = speakable.replace(/\bI\b/g, "Eye");

  speakable = speakable.replace(/\bcan['’]t\b/g, "cannot");
  speakable = speakable.replace(/\bdon['’]t\b/g, "do not");
  speakable = speakable.replace(/\bwon['’]t\b/g, "will not");
  speakable = speakable.replace(/\bit['’]s\b/g, "it is");
  speakable = speakable.replace(/\bthat['’]s\b/g, "that is");
  speakable = speakable.replace(/\bthere['’]s\b/g, "there is");
  speakable = speakable.replace(/\blet['’]s\b/g, "let us");
  speakable = speakable.replace(/\bwhat['’]s\b/g, "what is");
  speakable = speakable.replace(/\bhow['’]s\b/g, "how is");
  speakable = speakable.replace(/\byou['’]re\b/g, "you are");
  speakable = speakable.replace(/\bwe['’]re\b/g, "we are");
  speakable = speakable.replace(/\bthey['’]re\b/g, "they are");

  // 4. Unpack LaTeX math blocks ($$, $) and LaTeX brackets (\[ \], \( \))
  speakable = speakable.replace(/\$\$([\s\S]*?)\$\$/g, " $1 ");
  speakable = speakable.replace(/\$([^\$]+)\$/g, " $1 ");
  speakable = speakable.replace(/\\\[([\s\S]*?)\\\]/g, " $1 ");
  speakable = speakable.replace(/\\\(([\s\S]*?)\\\)/g, " $1 ");

  // 5. Normalize LaTeX \text{...}, \mathbf{...}, \mathrm{...}
  speakable = speakable.replace(/\\(?:text|mathbf|mathrm|mathit)\{([^}]+)\}/g, " $1 ");

  // 6. Normalize Fractions: \frac{a}{b} -> "a over b"
  speakable = speakable.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, " $1 over $2 ");

  // 7. Normalize Powers: x^2 -> "x squared", x^3 -> "x cubed", x^{n} -> "x to the power of n"
  speakable = speakable.replace(/(\w+)\^2\b/g, "$1 squared");
  speakable = speakable.replace(/(\w+)\^3\b/g, "$1 cubed");
  speakable = speakable.replace(/(\w+)\^\{([^}]+)\}/g, "$1 to the power of $2");
  speakable = speakable.replace(/(\w+)\^(\d+)/g, "$1 to the power of $2");

  // 8. Square Roots: \sqrt{x} -> "square root of x"
  speakable = speakable.replace(/\\sqrt\{([^}]+)\}/g, " square root of $1 ");

  // 9. Normalize Greek letters and Vedic notation tokens
  speakable = speakable.replace(/\\(?:theta|alpha|beta|gamma|pi)/gi, (m) => ` ${m.replace("\\", "")} `);
  speakable = speakable.replace(/\\overline\{([^}]+)\}/g, " $1 bar ");

  // 10. Specific math operators & symbols
  speakable = speakable.replace(/\\times|×|(?<=\d)\s*\*\s*(?=\d)/g, " times ");
  speakable = speakable.replace(/\\cdot|[·•]/g, " times ");
  speakable = speakable.replace(/\\div|÷/g, " divided by ");
  speakable = speakable.replace(/\\pm|±/g, " plus or minus ");
  speakable = speakable.replace(/\\approx|≈/g, " approximately ");
  speakable = speakable.replace(/\\leq|<=|≤/g, " less than or equal to ");
  speakable = speakable.replace(/\\geq|>=|≥/g, " greater than or equal to ");
  speakable = speakable.replace(/\\neq|!=|≠/g, " not equal to ");
  speakable = speakable.replace(/\\degree/g, " degrees ");
  speakable = speakable.replace(/\\dots|\.\.\./g, " and so on ");

  // 11. Clear Number Pronunciation & Vedic Notation:
  // Convert Vedic partition vertical bars (e.g. 15 | 6 or 12 | +2) into natural pauses, avoiding "pipe" or "vertical bar"
  speakable = speakable.replace(/(\d+)\s*\|\s*(\d+)/g, "$1, $2");
  speakable = speakable.replace(/\|\s*([+-]?\d+)/g, ", $1");
  speakable = speakable.replace(/([+-]?\d+)\s*\|/g, "$1, ");
  speakable = speakable.replace(/\|/g, ", ");

  // Distinct articulation for slash fractions: 23/24 -> 23 over 24
  speakable = speakable.replace(/(\d+)\s*\/\s*(\d+)/g, "$1 over $2");

  // Handle Vedic deviations like (+02), (+2), (-03), (-3) and signed numbers
  speakable = speakable.replace(/(?<=\s|\(|^)\+\s*(\d+)/g, "plus $1");
  speakable = speakable.replace(/(?<=\s|\(|^)-\s*(\d+)/g, "negative $1");

  // Arithmetic operations between numbers and variables
  speakable = speakable.replace(/(?<=\d|[a-zA-Z])\s*=\s*(?=\d|[a-zA-Z])/g, " equals ");
  speakable = speakable.replace(/(?<=\d)\s*\+\s*(?=\d)/g, " plus ");
  speakable = speakable.replace(/(?<=\d)\s*-\s*(?=\d)/g, " minus ");
  speakable = speakable.replace(/(\d+)\s*[xX]\s*(\d+)/g, "$1 times $2");

  // 12. Indian currency & units: ₹450 -> "450 rupees"
  speakable = speakable.replace(/₹\s*(\d+)/g, " $1 rupees ");

  // 13. Clean any remaining unhandled LaTeX commands (e.g. \large, \quad, \hspace)
  speakable = speakable.replace(/\\[a-zA-Z]+/g, " ");

  // 14. Strip markdown formatting: headers, bold, italics, bullets with NATURAL PAUSES
  speakable = speakable.replace(/^#{1,6}\s+([^\n]+)/gm, ". $1. ");
  speakable = speakable.replace(/\*\*([^*]+)\*\*/g, "$1");
  speakable = speakable.replace(/\*([^*]+)\*/g, "$1");
  speakable = speakable.replace(/__([^_]+)__/g, "$1");
  speakable = speakable.replace(/_([^_]+)_/g, "$1");
  speakable = speakable.replace(/^[*\-+]\s+/gm, ". ");
  speakable = speakable.replace(/^(\d+)\.\s+/gm, ". Step $1: ");

  // 15. Convert colons and semicolons into gentle spoken pauses
  speakable = speakable.replace(/:\s+/g, ", ");
  speakable = speakable.replace(/;\s+/g, ". ");
  speakable = speakable.replace(/\n+/g, ". ");

  // 16. Eliminate repeated words and phrase glitches (STRICTLY alphabetical words, NEVER numbers like 11 x 11)
  speakable = speakable.replace(/\b([a-zA-Z]+)(?:[,\s]+\1\b)+/gi, "$1");
  speakable = speakable.replace(/\b([a-zA-Z]+\s+[a-zA-Z]+)(?:[,\s]+\1\b)/gi, "$1");

  // 17. Collapse redundant punctuation (e.g. "..", ".,") and excessive whitespace
  speakable = speakable.replace(/\s*\.\s*\./g, ". ");
  speakable = speakable.replace(/\s*,\s*,/g, ", ");
  speakable = speakable.replace(/\s*,\s*\./g, ". ");
  speakable = speakable.replace(/\s+/g, " ").trim();

  return speakable;
}

class TextToSpeechService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private currentMessageId: string | null = null;
  private isSpeaking = false;
  private isPausedState = false;
  private stateListeners: Array<(state: TTSState) => void> = [];

  constructor() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded in browser
      };
    }
  }

  public subscribe(listener: (state: TTSState) => void): () => void {
    this.stateListeners.push(listener);
    listener(this.getState());
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.stateListeners.forEach((l) => l(state));
  }

  public getState(): TTSState {
    return {
      isPlaying: this.isSpeaking && !this.isPausedState,
      isPaused: this.isPausedState,
      currentMessageId: this.currentMessageId,
    };
  }

  /**
   * Speaks the text associated with a given message ID.
   */
  public speak(messageId: string, text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("SpeechSynthesis is not supported in this browser.");
      return;
    }

    // If currently speaking this exact message, toggle pause/resume
    if (this.currentMessageId === messageId) {
      if (this.isPausedState) {
        this.resume();
        return;
      } else if (this.isSpeaking) {
        this.pause();
        return;
      }
    }

    // Stop any existing utterance
    this.stop();

    const speakableText = normalizeMathForSpeech(text);
    if (!speakableText) return;

    this.utterance = new SpeechSynthesisUtterance(speakableText);
    this.currentMessageId = messageId;
    this.isSpeaking = true;
    this.isPausedState = false;

    // Pick a natural, articulate voice (prefer Natural Online, Google, or Neural voices over robotic desktop SAPI)
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.toLowerCase().includes("natural") ||
          v.name.toLowerCase().includes("online") ||
          v.name.toLowerCase().includes("google") ||
          v.name.toLowerCase().includes("neural")),
    );
    const naturalIndianVoice = voices.find(
      (v) =>
        (v.lang === "en-IN" || v.name.toLowerCase().includes("india")) &&
        (v.name.toLowerCase().includes("natural") ||
          v.name.toLowerCase().includes("online") ||
          v.name.toLowerCase().includes("google") ||
          v.name.toLowerCase().includes("neural")),
    );
    const cleanEnglishVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        !v.name.toLowerCase().includes("desktop") &&
        !v.name.toLowerCase().includes("ravi") &&
        !v.name.toLowerCase().includes("heera") &&
        !v.name.toLowerCase().includes("david") &&
        !v.name.toLowerCase().includes("zira"),
    );
    const fallbackEnglishVoice = voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) {
      this.utterance.voice = naturalVoice;
    } else if (naturalIndianVoice) {
      this.utterance.voice = naturalIndianVoice;
    } else if (cleanEnglishVoice) {
      this.utterance.voice = cleanEnglishVoice;
    } else if (fallbackEnglishVoice) {
      this.utterance.voice = fallbackEnglishVoice;
    }

    // Set rate to 0.92: ensures words are spoken distinctly and calmly, never running together
    this.utterance.rate = 0.92;
    this.utterance.pitch = 1.0;

    this.utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPausedState = false;
      this.notify();
    };

    this.utterance.onend = () => {
      this.isSpeaking = false;
      this.isPausedState = false;
      this.currentMessageId = null;
      this.notify();
    };

    this.utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      this.isSpeaking = false;
      this.isPausedState = false;
      this.currentMessageId = null;
      this.notify();
    };

    window.speechSynthesis.speak(this.utterance);
    this.notify();
  }

  public pause() {
    if (typeof window !== "undefined" && window.speechSynthesis && this.isSpeaking) {
      window.speechSynthesis.pause();
      this.isPausedState = true;
      this.notify();
    }
  }

  public resume() {
    if (typeof window !== "undefined" && window.speechSynthesis && this.isPausedState) {
      window.speechSynthesis.resume();
      this.isPausedState = false;
      this.notify();
    }
  }

  public stop() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isPausedState = false;
      this.currentMessageId = null;
      this.notify();
    }
  }
}

export const ttsService = new TextToSpeechService();
