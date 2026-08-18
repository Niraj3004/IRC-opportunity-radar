import cron from 'node-cron';
import { runAgentPipeline } from '../agent/pipeline';

export const startAgentJob = () => {
  // Run ONCE a day at 2:00 AM to give free APIs a long rest
  cron.schedule('0 2 * * *', async () => {
    console.log('🤖 Automaton: Waking up AI Agent Pipeline...');
    try {
      await runAgentPipeline();
      console.log('🤖 Automaton: AI Agent Pipeline finished successfully. Going back to sleep.');
    } catch (error) {
      console.error('❌ Automaton: AI Agent Pipeline failed:', error);
    }
  });
};
