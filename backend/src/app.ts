import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.config';
import { errorMiddleware } from './middlewares/error.middleware';
import { sendResponse } from './utils/response';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  sendResponse(res, 200, null, 'OK');
});

// Route manager placeholder
// app.use('/api', routes);

app.use(errorMiddleware);

export default app;
