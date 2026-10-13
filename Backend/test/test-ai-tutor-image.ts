import * as fs from 'fs';
import * as path from 'path';

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}
import { ConfigService } from '@nestjs/config';
import { AiTutorService } from '../src/ai-tutor/ai-tutor.service';
import { ImageAnalysisService } from '../src/ai-tutor/services/image-analysis.service';
import { MathSolverService } from '../src/ai-tutor/services/math-solver.service';
import { TutorNlpService } from '../src/ai-tutor/services/tutor-nlp.service';
import { TutorContextService } from '../src/ai-tutor/services/tutor-context.service';
import { KnowledgeService } from '../src/ai-tutor/services/knowledge.service';
import { ConversationService } from '../src/ai-tutor/services/conversation.service';
import { PromptService } from '../src/ai-tutor/services/prompt.service';
import { LlmService } from '../src/ai-tutor/services/llm.service';
import { GuardrailService } from '../src/ai-tutor/services/guardrail.service';
import { GeminiProvider } from '../src/ai-tutor/providers/gemini.provider';

// Create a 100x100 white PNG or simple image in base64
// We can use a simple 1x1 png or a small valid PNG
const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

async function main() {
  const config = new ConfigService();
  console.log('GEMINI_API_KEY present:', Boolean(config.get('GEMINI_API_KEY')));
  console.log('AI_MODEL_NAME:', config.get('AI_MODEL_NAME'));

  const mathSolver = new MathSolverService();
  const imageAnalysis = new ImageAnalysisService(config, mathSolver);

  console.log('\n--- Testing ImageAnalysisService.extractImageUnderstanding ---');
  try {
    const understanding = await imageAnalysis.extractImageUnderstanding({
      data: samplePngBase64,
      mimeType: 'image/png',
      fileName: 'test.png',
    }, 'What is in this image?');
    console.log('Understanding output:', JSON.stringify(understanding, null, 2));
  } catch (err: any) {
    console.error('ImageAnalysisService error:', err?.message || err);
  }
}

main();
