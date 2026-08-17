import { startAgentJob } from './agent.job';
import { startDigestJob } from './digest.job';
import { startReminderJob } from './reminder.job';

export const startCronJobs = () => {
  console.log('⚙️ Starting automated background jobs...');
  startAgentJob();
  startDigestJob();
  startReminderJob();
};
