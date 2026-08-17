import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  statusCode: 429,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 failed requests per hour
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  statusCode: 429,
});
