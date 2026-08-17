import app from './app';
import { env } from './config/env.config';
import { connectDB } from './config/db.config';
import { startCronJobs } from './jobs';

const startServer = async () => {
  await connectDB();
  
  // Start cron jobs
  startCronJobs();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });
};

startServer();
