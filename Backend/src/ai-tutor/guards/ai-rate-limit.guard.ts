import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AiRateLimitGuard implements CanActivate {
  private readonly requestWindows = new Map<number, number[]>();
  private readonly WINDOW_MS = 60 * 1000; // 1 minute window
  private readonly MAX_REQUESTS_PER_WINDOW = 20; // Max 20 requests per minute per user

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    // If unauthenticated, let JwtAuthGuard handle rejection
    if (!userId) {
      return true;
    }

    const now = Date.now();
    const timestamps = this.requestWindows.get(userId) || [];
    const validTimestamps = timestamps.filter((t) => now - t < this.WINDOW_MS);

    if (validTimestamps.length >= this.MAX_REQUESTS_PER_WINDOW) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'AI_TUTOR_RATE_LIMIT_EXCEEDED',
          message:
            'You have reached the maximum tutor message rate (20 requests/minute). Please pause a moment before asking again.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    validTimestamps.push(now);
    this.requestWindows.set(userId, validTimestamps);
    return true;
  }
}
