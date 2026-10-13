import { ValidationPipe } from '@nestjs/common';
import { SendTutorMessageDto } from '../src/ai-tutor/dto/tutor-message.dto';

async function test() {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });

  const payload = {
    message: "Please analyze this image",
    image: {
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      mimeType: "image/png",
      fileName: "test.png"
    }
  };

  try {
    const res = await pipe.transform(payload, {
      type: 'body',
      metatype: SendTutorMessageDto,
    });
    console.log('ValidationPipe output:', res);
    console.log('res.image:', res.image);
  } catch (e) {
    console.error('ValidationPipe error:', e);
  }
}

test();
