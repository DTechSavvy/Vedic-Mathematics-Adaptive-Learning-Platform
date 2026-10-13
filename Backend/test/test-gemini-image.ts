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
import { GeminiProvider } from '../src/ai-tutor/providers/gemini.provider';

// Create a simple SVG rendered to PNG or a valid minimal PNG containing "98 * 97"
// Let's create a minimal test PNG or use a known base64 image
async function test() {
  const config = new ConfigService();
  const provider = new GeminiProvider(config);

  console.log('Provider available:', provider.isAvailable());

  // A tiny valid 1x1 PNG:
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  console.log('\n--- Test 1: Sending request with inlineImage to GeminiProvider ---');
  try {
    const response = await provider.generate({
      systemPrompt: 'You are DWANDA AI, a Vedic Mathematics tutor. An image is attached.',
      userPrompt: '### UPLOADED PROBLEM IMAGE\nPlease examine this image and explain the Vedic solution for 98 * 97.\n\n### STUDENT MESSAGE\nPlease analyze this image',
      inlineImage: {
        data: base64Png,
        mimeType: 'image/png',
      },
    });

    console.log('GeminiProvider Response:');
    console.log(response.content);
  } catch (err: any) {
    console.error('GeminiProvider Error:', err?.message || err);
  }
}

test();
