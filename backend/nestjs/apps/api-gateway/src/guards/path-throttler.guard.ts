import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';

@Injectable()
export class PathThrottlerGuard extends ThrottlerGuard {
  private logger = new Logger(PathThrottlerGuard.name);

  private rules = [
    { pattern: /^\/api\/secure/, limit: 5, ttl: 60 },
    { pattern: /^\/api\/admin/, limit: 2, ttl: 60 },
  ];

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const {
      context,
      limit,
      ttl,
      throttler,
      blockDuration,
      getTracker,
      generateKey,
    } = requestProps;

    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const name = throttler.name || req.originalUrl;

    // Find matching rule for the current path
    const rule = this.rules.find((r) => r.pattern.test(req.originalUrl));

    // Generate key for this request
    const tracker = await getTracker(req, context);
    const key = generateKey(context, tracker, name);
    this.logger.debug(`Request path: ${req.originalUrl}. Name: ${name} Block duration: ${blockDuration}`);

    const incrementResult = await this.storageService.increment(
      key,
      ttl,
      limit,
      blockDuration,
      name,
    );

    if (!incrementResult.isBlocked) {
      await this.throwThrottlingException(context, {
        limit: limit,
        ttl: ttl,
        key,
        tracker,
        totalHits: incrementResult.totalHits,
        isBlocked: incrementResult.isBlocked,
        timeToBlockExpire: incrementResult.timeToBlockExpire,
        timeToExpire: incrementResult.timeToExpire,
      });
    }

    // Only apply throttling if there's a matching rule
    if (!rule) {
      this.logger.debug(
        `No throttling rule found for path: ${req.originalUrl}`,
      );
      return true; // Allow request if no rule matches
    }

    const customKey = generateKey(context, tracker, req.originalUrl);

    // Use the rule's limit and ttl instead of the default ones
    const customLimit = rule.limit;
    const customTtl = rule.ttl;

    this.logger.debug(
      `Applying throttling rule - limit: ${customLimit}, ttl: ${customTtl}`,
    );

    // Check throttling using custom limit and ttl
    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } =
      await this.storageService.increment(
        customKey,
        customTtl,
        customLimit,
        blockDuration,
        req.originalUrl,
      );

    // If blocked, throw throttling exception
    if (isBlocked) {
      await this.throwThrottlingException(context, {
        limit: customLimit,
        ttl: customTtl,
        key: customKey,
        tracker,
        totalHits,
        isBlocked,
        timeToBlockExpire,
        timeToExpire,
      });
    }

    // If limit exceeded, throw throttling exception
    if (totalHits > customLimit) {
      await this.throwThrottlingException(context, {
        limit: customLimit,
        ttl: customTtl,
        key: customKey,
        tracker,
        totalHits,
        isBlocked,
        timeToBlockExpire,
        timeToExpire,
      });
    }

    return true;
  }
}
