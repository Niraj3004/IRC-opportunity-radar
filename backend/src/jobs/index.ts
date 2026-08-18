import { startAgentJob } from './agent.job';
import { startDigestJob } from './digest.job';
import { startReminderJob } from './reminder.job';
import { startDiscoveryJob } from './discovery.job';

export const startCronJobs = () => {
  console.log('⚙️ Starting automated background jobs...');
  startAgentJob();
  startDigestJob();
  startReminderJob();
  startDiscoveryJob();
};
