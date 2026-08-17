import cron from 'node-cron';
import { runAgentPipeline } from '../agent/pipeline';

export const startAgentJob = () => {
  // Run every 4 hours automatically
  cron.schedule('0 */4 * * *', async () => {
    console.log('🤖 Automaton: Waking up AI Agent Pipeline...');
    try {
      await runAgentPipeline();
      console.log('🤖 Automaton: AI Agent Pipeline finished successfully. Going back to sleep.');
    } catch (error) {
      console.error('❌ Automaton: AI Agent Pipeline failed:', error);
    }
  });
};
