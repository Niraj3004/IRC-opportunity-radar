import FetchLog from '../models/FetchLog';
import { ISource } from '../models/Source';

export const hasSourceChanged = async (
  source: ISource,
  newHash: string,
  startedAt: Date
): Promise<boolean> => {
  if (source.lastHash === newHash) {
    // Unchanged, write a FetchLog and stop
    await FetchLog.create({
      sourceId: source._id,
      startedAt,
      finishedAt: new Date(),
      status: 'success',
      itemsFound: 0,
      itemsNew: 0,
      itemsChanged: 0,
      llmCalls: 0,
    });

    // Update source lastFetchedAt but keep the old hash
    source.lastFetchedAt = new Date();
    source.lastStatus = 'idle';
    await source.save();

    return false;
  }

  // Changed, update lastHash and continue
  source.lastHash = newHash;
  source.lastFetchedAt = new Date();
  await source.save();

  return true;
};
