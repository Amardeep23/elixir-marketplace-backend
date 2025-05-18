import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 30, // limit each IP to 30 requests/min
  message: 'Too many requests. Please try again later.',
});

export default limiter;
