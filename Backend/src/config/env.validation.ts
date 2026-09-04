import { plainToInstance } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  CLIENT_URL = 'http://localhost:5173';

  @IsString()
  JWT_EXPIRES_IN = '1d';

  @IsOptional()
  @IsString()
  GEMINI_API_KEY?: string;

  @IsOptional()
  @IsString()
  AI_MODEL_NAME = 'gemini-3.7-flash';

  @IsOptional()
  @IsInt()
  AI_PROVIDER_TIMEOUT_MS = 30000;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    {
      ...config,
      PORT: config.PORT ? Number(config.PORT) : 3000,
    },
    {
      enableImplicitConversion: true,
    },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const firstError = errors[0];
    const message =
      Object.values(firstError.constraints ?? {})[0] ??
      'Invalid environment configuration';

    throw new Error(message);
  }

  return validatedConfig;
}