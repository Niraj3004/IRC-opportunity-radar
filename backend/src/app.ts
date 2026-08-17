import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.config';
import { errorMiddleware } from './middlewares/error.middleware';
import { sendResponse } from './utils/response';
import { authenticate } from './middlewares/auth.middleware';
import { authorize } from './middlewares/role.middleware';
import { Roles } from './constants/role.constant';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(apiLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  sendResponse(res, 200, null, 'OK');
});

app.get('/api/test/protected', authenticate, authorize(Roles.MEMBER), (req, res) => {
  sendResponse(res, 200, { user: req.user }, 'You have accessed a protected route');
});

app.use('/api', routes);

app.use(errorMiddleware);

export default app;
