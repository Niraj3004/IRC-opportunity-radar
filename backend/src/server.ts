import app from './app';
import { env } from './config/env.config';
import { connectDB } from './config/db.config';

const startServer = async () => {
  await connectDB();
  
  // Start cron jobs placeholder
  // startCronJobs();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });
};

startServer();
