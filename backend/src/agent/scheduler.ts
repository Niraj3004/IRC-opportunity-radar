import cron from 'node-cron';
import { runAgentPipeline } from './pipeline';

export const startScheduler = () => {
  const schedule = process.env.CRON_SCHEDULE || '0 0 * * *'; 
  
  console.log(`📅 Starting agent scheduler with cron: ${schedule}`);
  
  cron.schedule(schedule, async () => {
    console.log('⏰ Cron triggered agent pipeline.');
    await runAgentPipeline();
  });
};
